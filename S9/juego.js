var fondo;
var carro;
var cursores;
var enemigos;
var timer;

var gasolinas;
var timerGasolina;

var puntaje = 0;
var vidas = 3;
var nivel = 1;
var textoPuntaje;
var textoVidas;
var textoNivel;

var sonidoFondo;
var sonidoColision;
var sonidoGasolina;

var Juego = {

    preload: function () {
        juego.load.image('bg', 'img/bg.png');
        juego.load.image('carro', 'img/carro.png');
        juego.load.image('carroMalo', 'img/carroMalo.png');
        juego.load.image('gasolina', 'img/gas.png');
        
        // Cargar sonidos
        juego.load.audio('musicaFondo', 'musicajuego.mp3');
        juego.load.audio('colision', 'carcrash.mp3');
        juego.load.audio('gasolina', 'fuel.wav');
    },

    mostrarPopup: function() {
        this.juegoTerminado = true;
        this.popup.visible = true;
    },

    reiniciarJuego: function() {
        puntaje = 0;
        vidas = 3;
        nivel = 1;
        this.juegoTerminado = false;
        
        // Detener y reiniciar música
        sonidoFondo.stop();
        sonidoFondo.play();
        
        juego.state.restart();
    },

    cambiarNivel: function() {
        nivel = 2;
        textoNivel.text = 'Nivel: ' + nivel;
        
        // Aumentar velocidad de enemigos y gasolinas
        enemigos.forEachAlive(function(enemigo) {
            enemigo.body.velocity.y = 300; // Más rápido en nivel 2
        });
        
        gasolinas.forEachAlive(function(gasolina) {
            gasolina.body.velocity.y = 300; // Más rápido en nivel 2
        });
        
        // Mostrar mensaje de cambio de nivel
        var mensajeNivel = juego.add.text(juego.width/2, juego.height/2, '¡NIVEL ' + nivel + '!', {
            fontSize: '32px',
            fill: '#FFFF00',
            fontFamily: 'Arial'
        });
        mensajeNivel.anchor.setTo(0.5);
        
        // Quitar mensaje después de 2 segundos
        juego.time.events.add(2000, function() {
            mensajeNivel.destroy();
        });
    },

    create: function () {

        // Inicializar sonidos
        sonidoFondo = juego.add.audio('musicaFondo');
        sonidoColision = juego.add.audio('colision');
        sonidoGasolina = juego.add.audio('gasolina');
        
        // Reproducir música de fondo en loop
        sonidoFondo.loop = true;
        sonidoFondo.play();

        // Fondo
        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');

        // Carro
        carro = juego.add.sprite(juego.width/2, 496, 'carro');
        carro.anchor.setTo(0.5);
        juego.physics.arcade.enable(carro);

        // Puntaje
        textoPuntaje = juego.add.text(10, 10, 'Puntaje: 0', { 
            fontSize: '18px', 
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });

        // Vidas
        textoVidas = juego.add.text(100, 10, 'Vidas: 3', { 
            fontSize: '18px', 
            fill: '#FF0000',
            fontFamily: 'Arial'
        });

        // Nivel
        textoNivel = juego.add.text(200, 10, 'Nivel: 1', { 
            fontSize: '18px', 
            fill: '#00FF00',
            fontFamily: 'Arial'
        });

        // Enemigos
        enemigos = juego.add.group();
        juego.physics.arcade.enable(enemigos, true);
        enemigos.enableBody = true;
        enemigos.createMultiple(20, 'carroMalo');
        enemigos.setAll('anchor.x', 0.5);
        enemigos.setAll('anchor.y', 0.5);
        enemigos.setAll('outOfBoundsKill', true);
        enemigos.setAll('checkWorldBounds', true);

        // Gasolinas
        gasolinas = juego.add.group();
        juego.physics.arcade.enable(gasolinas, true);
        gasolinas.enableBody = true;
        gasolinas.createMultiple(20, 'gasolina');
        gasolinas.setAll('anchor.x', 0.5);
        gasolinas.setAll('anchor.y', 0.5);
        gasolinas.setAll('outOfBoundsKill', true);
        gasolinas.setAll('checkWorldBounds', true);

        // --- POPUP GAME OVER ---
        this.popup = juego.add.group();

        var fondoPopup = juego.add.graphics(0, 0);
        fondoPopup.beginFill(0x000000, 0.7);
        fondoPopup.drawRect(0, 0, juego.width, juego.height);
        this.popup.add(fondoPopup);

        var cuadro = juego.add.graphics(0, 0);
        cuadro.beginFill(0x222222, 1);
        cuadro.drawRect(juego.width/2 - 120, juego.height/2 - 80, 240, 160);
        this.popup.add(cuadro);

        var txtGameOver = juego.add.text(
            juego.width/2, 
            juego.height/2 - 40, 
            "¡GAME OVER!", 
            { fontSize: "24px", fill: "#FFFFFF" }
        );
        txtGameOver.anchor.setTo(0.5);
        this.popup.add(txtGameOver);

        var txtPuntajeFinal = juego.add.text(
            juego.width/2, 
            juego.height/2, 
            "Puntaje: " + puntaje, 
            { fontSize: "18px", fill: "#FFFF00" }
        );
        txtPuntajeFinal.anchor.setTo(0.5);
        this.popup.add(txtPuntajeFinal);

        var btnReiniciar = juego.add.text(
            juego.width/2, 
            juego.height/2 + 40, 
            "Reiniciar", 
            { fontSize: "20px", fill: "#00FF00" }
        );
        btnReiniciar.anchor.setTo(0.5);
        btnReiniciar.inputEnabled = true;
        btnReiniciar.events.onInputDown.add(this.reiniciarJuego, this);
        this.popup.add(btnReiniciar);

        this.popup.visible = false;
        this.juegoTerminado = false;

        // Timers
        timer = juego.time.events.loop(1500, this.crearCarroMalo, this);
        timerGasolina = juego.time.events.loop(2000, this.crearGasolina, this);

        // Controles
        cursores = juego.input.keyboard.createCursorKeys();
    },

    update: function() {

        if (this.juegoTerminado) return;

        fondo.tilePosition.y += 3;

        if (cursores.right.isDown && carro.position.x < 245) {
            carro.position.x += 5;
        }
        else if (cursores.left.isDown && carro.position.x > 45) {
            carro.position.x -= 5;
        }
        
        // Verificar si sube de nivel
        if (puntaje >= 15 && nivel === 1) {
            this.cambiarNivel();
        }
        
        juego.physics.arcade.overlap(carro, enemigos, this.colisionEnemigo, null, this);
        juego.physics.arcade.overlap(carro, gasolinas, this.colisionGasolina, null, this);
    },

    crearCarroMalo: function() {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var enemigo = enemigos.getFirstDead();
        enemigo.physicsBodyType = Phaser.Physics.ARCADE;
        enemigo.reset(posicion * 73, 0);
        
        // Velocidad según el nivel
        if (nivel === 1) {
            enemigo.body.velocity.y = 200;
        } else {
            enemigo.body.velocity.y = 300;
        }
        
        enemigo.anchor.setTo(0.5);
    },

    crearGasolina: function() {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var gasolina = gasolinas.getFirstDead();
        gasolina.physicsBodyType = Phaser.Physics.ARCADE;
        gasolina.reset(posicion * 73, 0);
        
        // Velocidad según el nivel
        if (nivel === 1) {
            gasolina.body.velocity.y = 200;
        } else {
            gasolina.body.velocity.y = 300;
        }
        
        gasolina.anchor.setTo(0.5);
    },

    colisionEnemigo: function(carro, enemigo) {
        enemigo.kill();
        vidas -= 1;
        textoVidas.text = 'Vidas: ' + vidas;
        
        // Reproducir sonido de colisión
        sonidoColision.play();
        
        if (vidas <= 0) {
            puntaje = Math.max(0, puntaje - 10);
            textoPuntaje.text = 'Puntaje: ' + puntaje;
            this.mostrarPopup();
        } else {
            puntaje = Math.max(0, puntaje - 10);
            textoPuntaje.text = 'Puntaje: ' + puntaje;
        }
    },

    colisionGasolina: function(carro, gasolina) {
        gasolina.kill();
        puntaje += 5;
        textoPuntaje.text = 'Puntaje: ' + puntaje;
        
        // Reproducir sonido de gasolina
        sonidoGasolina.play();
    }
};


juego.state.add('Juego', Juego);
juego.state.start('Juego');