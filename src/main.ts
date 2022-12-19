import './style.css'
import { Game, AUTO } from 'phaser'
import { MainScene } from './game'
import { GameOver } from './Scenes'

export const game = new Game({
  type: AUTO,
  width: 480,
  height: 640,
  scene: [MainScene, GameOver],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200
      },
      debug: import.meta.env.VITE_APP_DEBUG === 'true'
    }
  }
})
