export default class PowerUp {
  constructor({ position = {x: 0, y: 0}, velocity }) {
    this.position = position
    this.velocity = velocity

    this.image = new Image()
    this.image.src = './img/lightningBolt.png'

    this.alpha = 1
    gsap.to(this, {
      alpha: 0,
      duration: .2,
      repeat: -1,
      yoyo: true,
      ease: 'linear'
    })

    this.radians = 0
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.translate(this.position.x + this.image.width/2, this.position.y + this.image.height/2)
    ctx.rotate(this.radians)
    ctx.translate(-this.position.x - this.image.width/2, -this.position.y - this.image.height/2)
    ctx.drawImage(this.image, this.position.x, this.position.y)
    ctx.restore()
  }

  update(ctx) {
    this.draw(ctx)
    this.radians += .01

    this.position.x += this.velocity.x
  }
}