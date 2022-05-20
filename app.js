const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// All HTML5 Elements
const startPanel = document.querySelector('#startPanel')
const restartPanel = document.querySelector('#restartPanel')
const startBtn = document.querySelector('#startBtn')
const restartBtn = document.querySelector('#restartBtn')
const finalScore = document.querySelector('#finalScore')
const scoreElement = document.querySelector('#scoreElement')
const volOnElem = document.querySelector('#volOnElem')
const volOffElem = document.querySelector('#volOffElem')

// All Classes
import Player from './classes/Player.js'
import Enemy from './classes/Enemy.js'
import Projectile from './classes/Projectile.js'
import Particle from './classes/Particle.js'
import PowerUp from './classes/PowerUp.js'
import BackgroundParticle from './classes/BackgroundParticle.js'

const { random, hypot, sin, cos, atan2 } = Math
const { shoot, damageTaken, explode, death, powerUpNoise, select, background } = audio

let player
let animationID
let intervalID
let spawnPowerUpsID
let score = 0
let frames = 0
let game = { active: false }

let projectiles = []
let enemies = []
let particles = []
let powerUps = []
let backgroundParticles = []

function init() {
  const X = canvas.width / 2, Y = canvas.height / 2
  player = new Player(X, Y, 15, 'white')
  projectiles = []
  enemies = []
  particles = []
  powerUps = []
  backgroundParticles = []
  animationID
  score = 0
  frames = 0
  scoreElement.textContent = 0
  game = { active: true }

  const spacing = 50

  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      backgroundParticles.push(
        new BackgroundParticle({
          position: { x, y },
          radius: 3
        })
      )
    }    
  }
}

function spawnEnemies() {
  intervalID = setInterval(() => {
    const radius = random() * (30 - 5) + 5
    let x, y

    if (random() < .5) {
      x = (random() < .5) ? 0 - radius : canvas.width + radius
      y = random() * canvas.height
    } else {
      x = random() * canvas.width
      y = (random() < .5) ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${random()*360}, 50%, 50%)`

    const angle = atan2(canvas.height/2 - y, canvas.width/2 - x)
    const velocity = {
      x: cos(angle),
      y: sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

function spawnPowerUps() {
  spawnPowerUpsID = setInterval(() => {
    powerUps.push(new PowerUp({
      position: { x: -30, y: random() * canvas.height },
      velocity: { x: random() + 2, y: 0 }
    }))
  }, 15000)
}

function createScoreLabel({ position, score }) {
  const scoreLabel = document.createElement('label')
  scoreLabel.textContent = score
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.color = 'white'
  scoreLabel.style.left = `${position.x}px`
  scoreLabel.style.top = `${position.y}px`
  scoreLabel.style.userSelect = 'none'
  scoreLabel.style.pointerEvents = 'none'
  // scoreLabel.classList.add('absolute')
  document.body.append(scoreLabel)

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: .75,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    }
  })
}

const fadeBackgroundParticles = (backgroundParticles, player) => {
  backgroundParticles.forEach(backgroundParticle => {
    backgroundParticle.draw(ctx)

    const distance = hypot(player.x - backgroundParticle.position.x, player.y - backgroundParticle.position.y)

    if (distance < 100) {
      backgroundParticle.alpha = 0
      if (distance > 70) backgroundParticle.alpha = 0.5
    }
    else if (distance > 100 && backgroundParticle.alpha < 0.1) backgroundParticle.alpha += 0.01
    else if (distance > 100 && backgroundParticle.alpha > 0.1) backgroundParticle.alpha -= 0.01
  })
}


function animate() {
  animationID = requestAnimationFrame(animate)
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  frames++

  fadeBackgroundParticles(backgroundParticles, player)

  player.update(canvas, ctx)

  for (let index = powerUps.length-1; index >= 0; index--) {
    const powerUp = powerUps[index]

    if (powerUp.position.x > canvas.width) {
      powerUps.splice(index, 1)
    } else {
      powerUp.update(ctx)
    }

    const distance = hypot(player.x - powerUp.position.x, player.y - powerUp.position.y)

    // gain powerUp
    if (distance < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(index, 1)
      player.powerUp = 'MachineGun'
      player.color = 'yellow'
      powerUpNoise.play()

      // powerUp overs
      setTimeout(() => {
        player.powerUp = null
        player.color = 'white'
      }, 5000)
    }
  }

  // machin gun animation / implementation
  if (player.powerUp === 'MachineGun') {
    const angle = atan2(mouse.position.y - player.y, mouse.position.x - player.x)
    const velocity = {
      x: cos(angle) * 5,
      y: sin(angle) * 5
    }

    if (frames % 2 == 0) {
      projectiles.push(new Projectile(player.x, player.y, 5, 'yellow', velocity))
    }

    if (frames % 5 == 0) shoot.play()
  }

  for (let index = particles.length-1; index >= 0; index--) {
    const particle = particles[index]
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update(ctx)
    }
  }

  for (let index = projectiles.length-1; index >= 0; index--) {
    const projectile = projectiles[index]
    projectile.update(ctx)

    // remove projectiles from edges of the screen
    if ((projectile.x + projectile.radius < 0) ||
        (projectile.x - projectile.radius > canvas.widht) ||
        (projectile.y + projectile.radius < 0) ||
        (projectile.y - projectile.radius > canvas.height)
    ) {
      projectiles.splice(index, 1)
    }
  }

  for (let index = enemies.length-1; index >= 0; index--) {
    const enemy = enemies[index]
    enemy.update(player, ctx)
    const distance = hypot(player.x - enemy.x, player.y - enemy.y)

    // end game || Game Over
    if (distance - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationID)
      clearInterval(intervalID)
      clearInterval(spawnPowerUpsID)
      death.play()
      game.active = false

      restartPanel.style.display = 'block'
      gsap.fromTo('#restartPanel', {scale: .8, opacity: 0},{
          scale: 1,
          opacity: 1,
          ease: 'expo'
        }
      )
      finalScore.textContent = score
    }

    for (let projectileIndex = projectiles.length-1; projectileIndex >= 0; projectileIndex--) {
      const projectile = projectiles[projectileIndex]
      const distance = hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // When projectile hits enemy
      if (distance - enemy.radius - projectile.radius < 1) {
        // create particle explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(
            projectile.x,
            projectile.y,
            random() * 2,
            enemy.color,
            {
              x: (random() - .5) * (random()*5),
              y: (random() - .5) * (random()*5)
            }
          ))
        }

        // this is where we shrink enemy
        if (enemy.radius - 10 > 5) {
          damageTaken.play()
          score += 100
          scoreElement.textContent = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y
            },
            score: 100
          })
          projectiles.splice(projectileIndex, 1)
        } else {
          // remove enemy if they are too small
          explode.play()
          score += 150
          scoreElement.textContent = score
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y
            },
            score: 150
          })

          // change background particle color based on enemy removed
          backgroundParticles.forEach(backgroundParticle => {
            gsap.set(backgroundParticle, {
              color: 'white',
              alpha: 1
            })
            gsap.to(backgroundParticle, {
              color: enemy.color,
              alpha: 0.1
            })
            // backgroundParticle.color = enemy.color
          })
          enemies.splice(index, 1)
          projectiles.splice(projectileIndex, 1)
        }
      }
    }
  }
}

let audioInitialized = false

function shootProjectile({x, y}) {
  if (game.active) {
    const angle = atan2(y - player.y, x - player.x)
    const velocity = {
      x: cos(angle) * 5,
      y: sin(angle) * 5
    }

    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity))
    shoot.play()
  }
}

// Events
addEventListener('click', ({ clientX, clientY }) => {
  if (!background.playing() && !audioInitialized) {
    background.play()
    audioInitialized = true
  }

  shootProjectile({x: clientX, y: clientY})
})

addEventListener('touchstart', (event) => {
  const x = event.touches[0].clientX
  const y = event.touches[0].clientY

  mouse.position.x = event.touches[0].clientX
  mouse.position.y = event.touches[0].clientY

  shootProjectile({x, y})
})

const mouse = {
  position: { x: 0, y: 0 }
}

addEventListener('mousemove', ({ clientX, clientY }) => {
  mouse.position.x = clientX
  mouse.position.y = clientY
})

addEventListener('touchmove', (event) => {
  mouse.position.x = event.touches[0].clientX
  mouse.position.y = event.touches[0].clientY
})

restartBtn.addEventListener('click', () => {
  select.play()
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('#restartPanel', {
    opacity: 0,
    scale: .8,
    duration: .2,
    ease: 'expo.in',
    onComplete: () => {
      restartPanel.style.display = 'none'
    }
  })
})

startBtn.addEventListener('click', () => {
  select.play()
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('#startPanel', {
    opacity: 0,
    scale: .8,
    duration: .2,
    ease: 'expo.in',
    onComplete: () => {
      startPanel.style.display = 'none'
    }
  })
})

// Mute everything
volOnElem.addEventListener('click', () => {
  background.pause()
  volOffElem.style.display = 'block'
  volOnElem.style.display = 'none'

  for (let key in audio) {
    audio[key].mute(true)
  }
})

// Unmute everything
volOffElem.addEventListener('click', () => {
  for (let key in audio) {
    audio[key].mute(false)
  }
  if (audioInitialized) background.play()
  volOffElem.style.display = 'none'
  volOnElem.style.display = 'block'
})

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // inactive
    // clear intervals
      clearInterval(intervalID)
      clearInterval(spawnPowerUpsID)
  } else {
    // spawnEnemies
    // spawn powerUps
    spawnEnemies()
    spawnPowerUps()
  }
})

addEventListener('keydown', ({ key }) => {
  switch(key) {
    case 'ArrowRight': case 'd':
      player.velocity.x += 1
      break
    case 'ArrowLeft': case 'a':
      player.velocity.x -= 1
      break
    case 'ArrowUp': case 'w':
      player.velocity.y -= 1
      break
    case 'ArrowDown': case 's':
      player.velocity.y += 1
      break
  }
})