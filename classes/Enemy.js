const { atan2, sin, cos, PI, random } = Math

export default class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'Linear'
    this.radians = 0
    this.center = { x, y }

    if (random() < .5) {
      this.type = 'Homing'

      if (random() < .5) {
        this.type = 'Spinning'

        if (random() < .5)
          this.type = 'Homing Spinning'
      }
    }
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update(player, ctx) {
    this.draw(ctx)
    if (this.type === 'Spinning') {
      this.radians += .1

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + cos(this.radians) * 30
      this.y = this.center.y + sin(this.radians) * 30
    } else if (this.type === 'Homing') {
      const angle = atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = cos(angle)
      this.velocity.y = sin(angle)

      this.x += this.velocity.x
      this.y += this.velocity.y
    } else if (this.type === 'Homing Spinning') {
      this.radians += .1

      const angle = atan2(player.y - this.center.y, player.x - this.center.x)
      this.velocity.x = cos(angle)
      this.velocity.y = sin(angle)

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + cos(this.radians) * 30
      this.y = this.center.y + sin(this.radians) * 30
    } else {
      // Liner movement
      this.x += this.velocity.x
      this.y += this.velocity.y
    }
  }
}