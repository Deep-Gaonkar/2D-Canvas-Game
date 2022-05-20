export default class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = { x: 0, y: 0 }
    this.powerUp
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update(canvas, ctx) {
    this.draw(ctx)

    const friction = .99

    this.velocity.x *= friction
    this.velocity.y *= friction

    // stop player from going off screen on X axis
    if ((this.x + this.radius + this.velocity.x <= canvas.width) && (this.x - this.radius + this.velocity.x >= 0)) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }

    // stop player from going off screen on Y axis
    if ((this.y + this.radius + this.velocity.y <= canvas.height) && (this.y - this.radius + this.velocity.y >= 0)) {
      this.y += this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }
}