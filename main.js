function main() {
    // Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // Define vertices data for a cube
    var vertices = [
        // Face A       // Red
        -1, -1, -1,     1, 0, 0,    // Index:  0    
         1, -1, -1,     1, 0, 0,    // Index:  1
         1,  1, -1,     1, 0, 0,    // Index:  2
        -1,  1, -1,     1, 0, 0,    // Index:  3
        // Face B       // Yellow
        -1, -1,  1,     1, 1, 0,    // Index:  4
         1, -1,  1,     1, 1, 0,    // Index:  5
         1,  1,  1,     1, 1, 0,    // Index:  6
        -1,  1,  1,     1, 1, 0,    // Index:  7
        // Face C       // Green
        -1, -1, -1,     0, 1, 0,    // Index:  8
        -1,  1, -1,     0, 1, 0,    // Index:  9
        -1,  1,  1,     0, 1, 0,    // Index: 10
        -1, -1,  1,     0, 1, 0,    // Index: 11
        // Face D       // Blue
         1, -1, -1,     0, 0, 1,    // Index: 12
         1,  1, -1,     0, 0, 1,    // Index: 13
         1,  1,  1,     0, 0, 1,    // Index: 14
         1, -1,  1,     0, 0, 1,    // Index: 15
        // Face E       // Orange
        -1, -1, -1,     1, 0.5, 0,  // Index: 16
        -1, -1,  1,     1, 0.5, 0,  // Index: 17
         1, -1,  1,     1, 0.5, 0,  // Index: 18
         1, -1, -1,     1, 0.5, 0,  // Index: 19
        // Face F       // White
        -1,  1, -1,     1, 1, 1,    // Index: 20
        -1,  1,  1,     1, 1, 1,    // Index: 21
         1,  1,  1,     1, 1, 1,    // Index: 22
         1,  1, -1,     1, 1, 1     // Index: 23
    ];

    var indices = [
        0, 1, 2,     0, 2, 3,     // Face A
        4, 5, 6,     4, 6, 7,     // Face B
        8, 9, 10,    8, 10, 11,   // Face C
        12, 13, 14,  12, 14, 15,  // Face D
        16, 17, 18,  16, 18, 19,  // Face E
        20, 21, 22,  20, 22, 23,  // Face F     
    ];

    // Create a linked-list for storing the vertices data
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create a linked-list for storing the indices data
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;
        void main() {
            vec4 originalPosition = vec4(aPosition, 1.);
            gl_Position = uProjection * uView * uModel * originalPosition;
            vColor = aColor;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        uniform vec3 uAmbientConstant;   // Represents the light color
        uniform float uAmbientIntensity;
        void main() {
            // Calculate the ambient effect
            vec3 ambient = uAmbientConstant * uAmbientIntensity;
            vec3 phong = ambient; // + diffuse + specular;
            // Apply the shading
            gl_FragColor = vec4(phong * vColor, 1.);
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

    // Lighting and Shading
    var uAmbientConstant = gl.getUniformLocation(shaderProgram, "uAmbientConstant");
    var uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
    gl.uniform3fv(uAmbientConstant, [1.0, 0.5, 0.0]); // orange light
    // gl.uniform3fv(uAmbientConstant, [1.0, 1.0, 1.0]); // white light
    gl.uniform1f(uAmbientIntensity, 0.6); // 60% of light

    var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");
    var perspectiveMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(perspectiveMatrix, Math.PI/3, 1.0, 0.5, 10.0);

    var freeze = false;
    // Interactive graphics with mouse
    function onMouseClick(event) {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick);
    // Interactive graphics with keyboard
    var cameraX = 0.0;
    var cameraZ = 5.0;
    var uView = gl.getUniformLocation(shaderProgram, "uView");
    var viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(
        viewMatrix,
        [cameraX, 0.0, cameraZ],    // the location of the eye or the camera
        [cameraX, 0.0, -10],        // the point where the camera look at
        [0.0, 1.0, 0.0]
    );
    function onKeydown(event) {
        if (event.keyCode == 32) freeze = true;
        if (event.keyCode == 37) cameraX -= 0.1; // Left
        if (event.keyCode == 38) cameraZ -= 0.1; // Up
        if (event.keyCode == 39) cameraX += 0.1; // Right
        if (event.keyCode == 40) cameraZ += 0.1; // Down
        glMatrix.mat4.lookAt(
            viewMatrix,
            [cameraX, 0.0, cameraZ],    // the location of the eye or the camera
            [cameraX, 0.0, -10],        // the point where the camera look at
            [0.0, 1.0, 0.0]
        );
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
            // glMatrix.mat4.scale(modelMatrix, modelMatrix, [changeY, changeY, changeY]);
            glMatrix.mat4.rotate(modelMatrix, modelMatrix, changeX, [0.0, 0.0, 1.0]);   // Rotation about Z axis
            glMatrix.mat4.rotate(modelMatrix, modelMatrix, changeY, [0.0, 1.0, 0.0]);   // Rotation about Y axis
            glMatrix.mat4.translate(modelMatrix, modelMatrix, [changeX, changeY, 0.0]);
            gl.uniformMatrix4fv(uModel, false, modelMatrix);
            gl.uniformMatrix4fv(uView, false, viewMatrix);
            gl.uniformMatrix4fv(uProjection, false, perspectiveMatrix);
        }
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var primitive = gl.TRIANGLES;
        var offset = 0;
        var nVertex = indices.length;
        gl.drawArrays(primitive, offset, nVertex);
        gl.drawElements(primitive, nVertex, gl.UNSIGNED_SHORT, offset);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}