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
         0.5, -0.5, 0.0, 1.0, 0.0,    // Point B
        -0.5, -0.5, 1.0, 0.0, 0.0,    // Point A
        -0.5,  0.5, 0.0, 0.0, 1.0,    // Point C
         0.5,  0.5, 1.0, 1.0, 1.0,    // Point D
         0.5, -0.5, 0.0, 1.0, 0.0,    // Point B
        -0.5,  0.5, 0.0, 0.0, 1.0     // Point C
    ];

    // Create a linked-list for storing the vertices data
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec2 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform float uChange;
        void main() {
            gl_Position = vec4(aPosition + uChange, 0.0, 1.0);
            vColor = aColor;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
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
        2, 
        gl.FLOAT, 
        false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        0
    );
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(
        aColor,
        3,
        gl.FLOAT,
        false, 
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aColor);

    var count = 0;
    var speedRaw = 1;
    var fps = 60;
    var speed = speedRaw / fps / 10;
    var change = 0;
    var uChange = gl.getUniformLocation(shaderProgram, "uChange");
    function render() {
        setTimeout( function() {
            change = change + speed;
            gl.uniform1f(uChange, change);
            console.log(++count);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            var primitive = gl.TRIANGLES;
            var offset = 0;
            var nVertex = 6;
            gl.drawArrays(primitive, offset, nVertex);
            render();
        }, 1000/fps);
    }
    render(); 
}