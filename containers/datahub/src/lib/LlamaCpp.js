const LLAMA_DOCKER_HOST = process.env.LLAMACPP_DOCKER_HOST || '0.0.0.0';
const LLAMA_DOCKER_PORT = process.env.LLAMACPP_DOCKER_PORT || 8000;

export class LlamaCpp {
  constructor() {
  }
  // ************************************************************************************************
  async createJsonFromString(inputString) {
    // Split the string by new lines
    const lines = inputString.split('\n');

    // Initialize an array to store the result
    const result = { "list": [] };

    // Loop through each line
    let i = 0;
    lines.forEach(line => {
      const digit = line.match(/\d+/);
      if (digit) {
        i = i + 1;
        const fixedLine = line.substring(digit.index);
        result.list.push({ [i]: fixedLine });
      }
    });

    return result;
  }
  
  // ************************************************************************************************
  async llamacppCall(text) {
    const url = `http://${LLAMA_DOCKER_HOST}:${LLAMA_DOCKER_PORT}/completion`;

    const pr = `
    ### System: Du bist eine Beratungsstelle in einer Behörde.
    Anhand von einem oder mehrerer Schlagworte oder kurzer Aussagen suchst Du mögliche kurze Titel von Anträgen,
    die Dir dazu einfallen.
    Ich gebe dir ein Schlagwort aus dem du eine nummerische Liste
    mit fünf Einträgen für mögliche Anträge generierst.
    Die Einträge in der Liste fangen immer mit einer Zahl an.    
    Du beendest die Liste immer mit "### ENDE.".

    ### Hintergrund: ${text}

    ### Schlagworte: ${text}
    `;
    const data = {
      prompt: pr,
      n_predict: 128,
    };


    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        //throw new Error(`HTTP error! Status: ${response.status}`);
        return { "content": "error" };
      }
      const result = await response.json();
      const jsonList = await this.createJsonFromString(result['content']);

      return {
        //"content": result['content'],
        "result_list": jsonList['list']
      };
      //const result = await response.json();
      //console.log(result);
    } catch (error) {
      //console.error("Error fetching completion:", error);
      return { "content": "Connection problem to llamacpp", "error": error };
    }
  }
}
