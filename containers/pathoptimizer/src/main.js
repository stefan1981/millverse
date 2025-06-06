import Phaser from 'phaser';
import Simulation from './scenes/Simulation';

const config = {
  type: Phaser.AUTO,
  parent: 'phasercontainer', // 👈 mount canvas inside this div
  backgroundColor: '#060121',
  scene: [Simulation],
  scale: {
    mode: Phaser.Scale.NONE, // 👈 fixed size
    //autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1800,
    height: 1100
  },
  input: {
    activePointers: 3,
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 35,
      debug: false,
    },
  },
};

new Phaser.Game(config);

// Optional confirmation dialog on exit
window.addEventListener('beforeunload', (event) => {
  const message = 'ARE YOU SURE YOU WANT TO LEAVE THE GAME?';
  event.returnValue = message;
  event.preventDefault();
});
