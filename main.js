function main() {
    // Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // Define vertices data for three points
    /**
     * A (-0.5, -0.5), Red   (1.0, 0.0, 0.0)
     * B ( 0.5, -0.5), Green (0.0, 1.0, 0.0)
     * C (-0.5,  0.5), Blue  (0.0, 0.0, 1.0)
     * D ( 0.5,  0.5), White (1.0, 1.0, 1.0)
     */
    var vertices = [
         0.5, -0.5, 0.0, 0.0, 1.0, 0.0,    // Point B
        -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,    // Point A
        -0.5,  0.5, 0.0, 0.0, 0.0, 1.0,    // Point C
         0.5,  0.5, 0.0, 1.0, 1.0, 1.0,    // Point D
         0.5, -0.5, 0.0, 0.0, 1.0, 0.0,    // Point B
        -0.5,  0.5, 0.0, 0.0, 0.0, 1.0     // Point C
    ];

    // Create a linked-list for storing the vertices data
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform mat4 uModel;
        void main() {
            vec4 originalPosition = vec4(aPosition, 1.);
            gl_Position = uModel * originalPosition;
            vColor = aColor;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.);
        }
    `;

    // Create .c in GPU
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    // Compile .c into .o
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Prepare a .exe shell (shader program)
    var shaderProgram = gl.createProgram();

    // Put the two .o files into the shell
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // Link the two .o files, so together they can be a runnable program/context.
    gl.linkProgram(shaderProgram);

    // Start using the context (analogy: start using the paints and the brushes)
    gl.useProgram(shaderProgram);

    // Teach the computer how to collect
    //  the positional values from ARRAY_BUFFER
    //  to each vertex being processed
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(
        aPosition, 
        3, 
        gl.FLOAT, 
        false, 
        6 * Float32Array.BYTES_PER_ELEMENT, 
        0
    );
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(
        aColor,
        3,
        gl.FLOAT,
        false, 
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aColor);

    var freeze = false;
    // Interactive graphics with mouse
    function onMouseClick(event) {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick);
    // Interactive graphics with keyboard
    function onKeydown(event) {
        if (event.keyCode == 32) freeze = true;
    }
    function onKeyup(event) {
        if (event.keyCode == 32) freeze = false;
    }
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);

    var speedRaw = 1;
    var speedX = speedRaw / 600;
    var speedY = 2 * speedRaw / 600;
    var changeX = 0;
    var changeY = 0;
    var uModel = gl.getUniformLocation(shaderProgram, "uModel");
    function render() {
        if (!freeze) {  // If it is not freezing, then animate the rectangle
            if (changeX >= 0.5 || changeX <= -0.5) speedX = -speedX;
            if (changeY >= 0.5 || changeY <= -0.5) speedY = -speedY;
            changeX = changeX + speedX;
            changeY = changeY + speedY;
            var modelMatrix = glMatrix.mat4.create();
            glMatrix.mat4.rotate(modelMatrix, modelMatrix, changeX, [0.0, 0.0, 1.0]);
            glMatrix.mat4.translate(modelMatrix, modelMatrix, [changeX, changeY, 0.0]);
            gl.uniformMatrix4fv(uModel, false, modelMatrix);
        }
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var primitive = gl.TRIANGLES;
        var offset = 0;
        var nVertex = 6;
        gl.drawArrays(primitive, offset, nVertex);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}