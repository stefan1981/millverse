
export class DataFrame {
  constructor(data) {
    // Speichert die ursprünglichen Daten
    this.data = data;
    //this.columns = this.getColumns();
  }

  async init() {
    this.columns = await this.getColumns();
    return this;
  }  
  // ************************************************************************************************
  async getColumns() {
    if (!this.data || this.data.length === 0) return [];
    const tmp = Object.keys(this.data[0]);
    // console.log('-----------------------------')
    // console.log(tmp)
    // console.log('-----------------------------')
    return tmp;
  }

  // ************************************************************************************************
  async getData() {
    // Mappt die Daten, um die Werte in Form eines Arrays zurückzugeben
    return this.data.map(item => Object.values(item));
  }  
}
