import { Math, Scene, Physics, Types, GameObjects } from 'phaser'
import bgLayer1Png from './assets/bg_layer1.png'
import groundGrassPng from './assets/ground_grass.png'
import bunnyStandPng from './assets/bunny1_stand.png'
import carrotPng from './assets/carrot.png'
import bunny1JumpPng from './assets/bunny1_jump.png'
import phaseJump1Ogg from './assets/sfx/phaseJump1.ogg'
import powerUp2Ogg from './assets/sfx/powerUp2.ogg'
import { Carrot } from './Entities'

type Sprite = Physics.Arcade.Sprite
type StaticGroup = Physics.Arcade.StaticGroup
type CursorKeys = Types.Input.Keyboard.CursorKeys
type ArcadeGroup = Physics.Arcade.Group

export class MainScene extends Scene {
  private player: Sprite | null = null
  private platforms: StaticGroup | null = null
  private cursors: CursorKeys | null = null
  private carrots: ArcadeGroup | null = null
  private carrotsCollected = 0
  private carrotsCollectedText: GameObjects.Text | null = null
  private pointerMark = 0

  constructor () {
    super({ key: 'mainScene' })
  }

  init () {
    this.carrotsCollected = 0
  }

  preload () {
    // load the background image
    this.load.image('background', bgLayer1Png)
    // load the platform image
    this.load.image('platform', groundGrassPng)
    // add this new line
    this.load.image('bunny-stand', bunnyStandPng)
    // load carrot image
    this.load.image('carrot', carrotPng)
    // load bunny jump
    this.load.image('bunny-jump', bunny1JumpPng)
    // load audio jump
    this.load.audio('jump', phaseJump1Ogg)
    this.load.audio('carrot-collected', powerUp2Ogg)
    // set keyboard cursors
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create () {
    // add a background image
    this.add.image(240, 320, 'background').setScrollFactor(1, 0)
    // create the group
    this.platforms = this.physics.add.staticGroup()

    for (let i = 0; i < 5; ++i) {
      const x = Math.Between(80, 400)
      const y = 150 * i

      const platform: Sprite = this.platforms.create(x, y, 'platform')
      platform.scale = 0.5

      const body = platform.body
      body.updateFromGameObject()
    }
    // setting player
    this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
      .setScale(0.5)

    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false

    // setting camera
    this.cameras.main.startFollow(this.player)
    // set the horizontal dead zone to 1.5x game width
    this.cameras.main.setDeadzone(this.scale.width * 1.5)
    //
    this.carrots = this.physics.add.group({
      classType: Carrot
    })

    // setting collider physics
    this.physics.add.collider(this.platforms, this.player)
    this.physics.add.collider(this.platforms, this.carrots)

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot, // called on overlap
      undefined,
      this
    )

    const style = { color: '#000', fontSize: '24px', fontFamilt: 'Arial' }
    this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0)

    if (import.meta.env.VITE_APP_DEBUG === 'true') {
      this.input.addPointer()
    }
  }

  update (): void {
    if (this.player && this.cursors) {
      const touchingDown = this.player.body.touching.down

      if (touchingDown) {
        // this makes the bunny jump straight up
        this.player.setVelocityY(-320)
        this.player.setTexture('bunny-jump')
        this.sound.play('jump')
      }

      const vy = this.player.body.velocity.y

      if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
        // switch back to jump when falling
        this.player.setTexture('bunny-stand')
      }

      // left and right input logic
      if (this.cursors.left.isDown && !touchingDown) {
        this.player.setVelocityX(-200)
      } else if (this.cursors.right.isDown && !touchingDown) {
        this.player.setVelocityX(200)
      } else if (this.input.activePointer.isDown && !touchingDown) {
        console.log(this.input.activePointer)

        if (!this.pointerMark) {
          this.pointerMark = this.input.activePointer.worldX
        }

        if (this.input.activePointer.worldX < this.pointerMark) {
          this.player.setVelocityX(-200)
        } else {
          this.player.setVelocityX(200)
        }
      } else {
        // stop movement if not left or right
        this.player.setVelocityX(0)
        this.pointerMark = 0
      }

      this.horizontalWrap(this.player)

      const bottomPlatform = this.findBottomMostPlatform()
      if (this.player.y > bottomPlatform!.y + 200) {
        this.scene.start('game-over')
      }
    }

    if (this.platforms) {
      this.platforms.children.entries.forEach((child) => {
        const platform = child as Sprite
        const scrollY = this.cameras.main.scrollY

        if (platform.y >= scrollY + 700) {
          platform.y = scrollY - Math.Between(50, 80)
          platform.body.updateFromGameObject()
          // create a carrot above the platform being reused
          this.addCarrotAbove(platform)
        }
      })
    }
  }

  horizontalWrap (sprite: Sprite) {
    const halfWidth = sprite.displayWidth * 0.5
    const gameWidth = this.scale.width

    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth
    }
  }

  addCarrotAbove (sprite: Sprite) {
    if (!this.carrots) return

    const y = sprite.y - sprite.displayHeight

    const carrot: Sprite = this.carrots.get(sprite.x, y, 'carrot')

    // set active and visible
    carrot.setActive(true)
    carrot.setVisible(true)

    this.add.existing(carrot)

    // update the physics body size
    carrot.body.setSize(carrot.width, carrot.height)

    // make sure body is enabed in the physics world
    this.physics.world.enable(carrot)

    return carrot
  }

  handleCollectCarrot (_: any, object2: any) {
    if (!this.carrots) return
    const carrot = object2 as Sprite
    // hide from display
    this.carrots.killAndHide(carrot)

    // disable from physics world
    this.physics.world.disableBody(carrot.body)

    this.carrotsCollected++
    this.sound.play('carrot-collected')
    this.carrotsCollectedText!.text = `Carrots: ${this.carrotsCollected}`
  }

  findBottomMostPlatform () {
    if (!this.platforms) return
    const platforms = this.platforms.getChildren() as Sprite[]
    let bottomPlatform = platforms[0]

    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i]

      // discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue
      }

      bottomPlatform = platform
    }

    return bottomPlatform
  }
}
