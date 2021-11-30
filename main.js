function main() {
    // Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // For texture
    var texture, uSampler;
    function initTextures(callback) {
        texture = gl.createTexture();
        if (!texture) {
            console.log("Failed to create the texture object");
        }
        var image = new Image();
        if (!image) {
            console.log("Failed to create the image object");
        }
        // Register the event handler to be called on loading an image
        image.onload = function() { loadTexture(image, callback) };
        // Tell the browser to load an image
        image.src = "txCrate.bmp";
    }
    function loadTexture(image, callback) {
        // Flip the image's y axis
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.bindTexture(gl.TEXTURE_2D, null);

        if (callback) {
            callback();
        }
    }

    // Define vertices data for a cube
    var vertices = [
        // Face A       // Texture Coordinate       // Red      // Surface orientation (normal vector)
        -1, -1, -1,     0, 0,                       1, 0, 0,    0, 0, -1,    // Index:  0    
         1, -1, -1,     1, 0,                       1, 0, 0,    0, 0, -1,    // Index:  1
         1,  1, -1,     1, 1,                       1, 0, 0,    0, 0, -1,    // Index:  2
        -1,  1, -1,     0, 1,                       1, 0, 0,    0, 0, -1,    // Index:  3
        // Face B       // Yellow
        -1, -1,  1,     0, 0,                       1, 1, 0,    0, 0, 1,     // Index:  4
         1, -1,  1,     1, 0,                       1, 1, 0,    0, 0, 1,     // Index:  5
         1,  1,  1,     1, 1,                       1, 1, 0,    0, 0, 1,     // Index:  6
        -1,  1,  1,     0, 1,                       1, 1, 0,    0, 0, 1,     // Index:  7
        // Face C       // Green
        -1, -1, -1,     0, 0,                       0, 1, 0,    -1, 0, 0,    // Index:  8
        -1,  1, -1,     1, 0,                       0, 1, 0,    -1, 0, 0,    // Index:  9
        -1,  1,  1,     1, 1,                       0, 1, 0,    -1, 0, 0,    // Index: 10
        -1, -1,  1,     0, 1,                       0, 1, 0,    -1, 0, 0,    // Index: 11
        // Face D       // Blue
         1, -1, -1,     0, 0,                       0, 0, 1,    1, 0, 0,     // Index: 12
         1,  1, -1,     1, 0,                       0, 0, 1,    1, 0, 0,     // Index: 13
         1,  1,  1,     1, 1,                       0, 0, 1,    1, 0, 0,     // Index: 14
         1, -1,  1,     0, 1,                       0, 0, 1,    1, 0, 0,     // Index: 15
        // Face E       // Orange
        -1, -1, -1,     0, 0,                       1, 0.5, 0,  0, -1, 0,    // Index: 16
        -1, -1,  1,     0, 1,                       1, 0.5, 0,  0, -1, 0,    // Index: 17
         1, -1,  1,     1, 1,                       1, 0.5, 0,  0, -1, 0,    // Index: 18
         1, -1, -1,     1, 0,                       1, 0.5, 0,  0, -1, 0,    // Index: 19
        // Face F       // White
        -1,  1, -1,     0, 0,                       1, 1, 1,    0, 1, 0,     // Index: 20
        -1,  1,  1,     0, 1,                       1, 1, 1,    0, 1, 0,     // Index: 21
         1,  1,  1,     1, 1,                       1, 1, 1,    0, 1, 0,     // Index: 22
         1,  1, -1,     1, 0,                       1, 1, 1,    0, 1, 0      // Index: 23
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
        attribute vec2 aTexCoord;
        attribute vec3 aColor;
        attribute vec3 aNormal;
        varying vec3 vPosition;
        varying vec2 vTexCoord;
        varying vec3 vColor;
        varying vec3 vNormal;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;
        void main() {
            vec4 originalPosition = vec4(aPosition, 1.);
            gl_Position = uProjection * uView * uModel * originalPosition;
            vPosition = (uModel * originalPosition).xyz;
            vTexCoord = aTexCoord;
            vColor = aColor;
            vNormal = aNormal;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vPosition;
        varying vec2 vTexCoord;
        varying vec3 vColor;
        varying vec3 vNormal;
        uniform vec3 uAmbientConstant;   // Represents the light color
        uniform float uAmbientIntensity;
        uniform vec3 uDiffuseConstant;  // Represents the light color
        uniform vec3 uLightPosition;
        uniform mat3 uNormalModel;
        uniform vec3 uSpecularConstant; // Represents the light color
        uniform vec3 uViewerPosition;
        uniform sampler2D uSampler;
        void main() {
            
            // Calculate the ambient component
            vec3 ambient = uAmbientConstant * uAmbientIntensity;
            
            // Prepare the diffuse components
            vec3 normalizedNormal = normalize(uNormalModel * vNormal);
            vec3 vLight = uLightPosition - vPosition;
            vec3 normalizedLight = normalize(vLight);
            vec3 diffuse = vec3(0., 0., 0.);
            float cosTheta = max(dot(normalizedNormal, normalizedLight), 0.);

            // Prepare the specular components
            vec3 vReflector = 2.0 * cosTheta * vNormal - (vLight);
            // or using the following expression
            // vec3 vReflector = reflect(-vLight, vNormal);
            vec3 vViewer = uViewerPosition - vPosition;
            vec3 normalizedViewer = normalize(vViewer);
            vec3 normalizedReflector = normalize(vReflector);
            float shininessConstant = 100.0;
            vec3 specular = vec3(0., 0., 0.);
            float cosPhi = max(dot(normalizedViewer, normalizedReflector), 0.);
            
            // Calculate the phong reflection effect
            if (cosTheta > 0.) {
                diffuse = uDiffuseConstant * cosTheta;
            }
            if (cosPhi > 0.) {
                specular = uSpecularConstant * pow(cosPhi, shininessConstant);
            }
            vec3 phong = ambient + diffuse + specular;

            // Apply the shading
            vec4 textureColor = texture2D(uSampler, vTextCoord);
            gl_FragColor = vec4(phong, 1.) * textureColor;
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
        11 * Float32Array.BYTES_PER_ELEMENT, 
        0
    );
    gl.enableVertexAttribArray(aPosition);
    var aTexCoord = gl.getAttribLocation(shaderProgram, "aTexCoord");
    gl.vertexAttribPointer(
        aTexCoord,
        2,
        gl.FLOAT,
        false, 
        11 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aTexCoord);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(
        aColor,
        3,
        gl.FLOAT,
        false, 
        11 * Float32Array.BYTES_PER_ELEMENT,
        5 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aColor);
    var aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.vertexAttribPointer(
        aNormal,
        3,
        gl.FLOAT,
        false, 
        11 * Float32Array.BYTES_PER_ELEMENT,
        8 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aNormal);

    // Lighting and Shading
    // AMBIENT
    var uAmbientConstant = gl.getUniformLocation(shaderProgram, "uAmbientConstant");
    var uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
    // gl.uniform3fv(uAmbientConstant, [1.0, 0.5, 0.0]);    // orange light
    gl.uniform3fv(uAmbientConstant, [1.0, 1.0, 1.0]);       // white light
    gl.uniform1f(uAmbientIntensity, 0.2); // 20% of light
    // DIFFUSE
    var uDiffuseConstant = gl.getUniformLocation(shaderProgram, "uDiffuseConstant");
    var uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");
    var uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");
    gl.uniform3fv(uDiffuseConstant, [1.0, 1.0, 1.0]);   // white light
    gl.uniform3fv(uLightPosition, [-1.0, 1.0, 1.0]);    // light position

    // Perspective projection
    var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");
    var perspectiveMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(perspectiveMatrix, Math.PI/3, 1.0, 0.5, 10.0);
    gl.uniformMatrix4fv(uProjection, false, perspectiveMatrix);

    // Interactive orbital rotation with mouse using quaternion concept
    var lastPointOnTrackBall, currentPointOnTrackBall;
    var lastQuat = glMatrix.quat.create();
    function computeCurrentQuat() {
        // Secara berkala hitung quaternion rotasi setiap ada perubahan posisi titik pointer mouse
        var axisFromCrossProduct = glMatrix.vec3.cross(glMatrix.vec3.create(), lastPointOnTrackBall, currentPointOnTrackBall);
        var angleFromDotProduct = Math.acos(glMatrix.vec3.dot(lastPointOnTrackBall, currentPointOnTrackBall));
        var rotationQuat = glMatrix.quat.setAxisAngle(glMatrix.quat.create(), axisFromCrossProduct, angleFromDotProduct);
        glMatrix.quat.normalize(rotationQuat, rotationQuat);
        return glMatrix.quat.multiply(glMatrix.quat.create(), rotationQuat, lastQuat);
    }
    // Memproyeksikan pointer mouse agar jatuh ke permukaan ke virtual trackball
    function getProjectionPointOnSurface(point) {
        var radius = canvas.width/3;  // Jari-jari virtual trackball kita tentukan sebesar 1/3 lebar kanvas
        var center = glMatrix.vec3.fromValues(canvas.width/2, canvas.height/2, 0);  // Titik tengah virtual trackball
        var pointVector = glMatrix.vec3.subtract(glMatrix.vec3.create(), point, center);
        pointVector[1] = pointVector[1] * (-1); // Flip nilai y, karena koordinat piksel makin ke bawah makin besar
        var radius2 = radius * radius;
        var length2 = pointVector[0] * pointVector[0] + pointVector[1] * pointVector[1];
        if (length2 <= radius2) pointVector[2] = Math.sqrt(radius2 - length2); // Dapatkan nilai z melalui rumus Pytagoras
        else {  // Atur nilai z sebagai 0, lalu x dan y sebagai paduan Pytagoras yang membentuk sisi miring sepanjang radius
            pointVector[0] *= radius / Math.sqrt(length2);
            pointVector[1] *= radius / Math.sqrt(length2);
            pointVector[2] = 0;
        }
        return glMatrix.vec3.normalize(glMatrix.vec3.create(), pointVector);
    }
    
    var rotationMatrix = glMatrix.mat4.create();
    var dragging;
    function onMouseDown(event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        // When the mouse pointer is inside the frame
        if (
            rect.left <= x &&
            rect.right >= x &&
            rect.top <= y &&
            rect.bottom >= y
        ) {
            dragging = true;
        }
        lastPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
        currentPointOnTrackBall = lastPointOnTrackBall;
    }
    function onMouseUp(event) {
        dragging = false;
        if (currentPointOnTrackBall != lastPointOnTrackBall) {
            lastQuat = computeCurrentQuat();
        }
    }
    function onMouseMove(event) {
        if (dragging) {
            var x = event.clientX;
            var y = event.clientY;
            currentPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
            glMatrix.mat4.fromQuat(rotationMatrix, computeCurrentQuat());
        }
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    // Interactive graphics with keyboard
    var cameraX = 0.0;
    var cameraY = 0.0;
    var cameraZ = 5.0;
    var uView = gl.getUniformLocation(shaderProgram, "uView");
    var viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(
        viewMatrix,
        [cameraX, cameraY, cameraZ],    // the location of the eye or the camera
        [cameraX, 0.0, -10],        // the point where the camera look at
        [0.0, 1.0, 0.0]
    );
    gl.uniformMatrix4fv(uView, false, viewMatrix);
    function onKeydown(event) {
        if (event.keyCode == 32) freeze = true;
        if (event.keyCode == 37) cameraX -= 0.1; // Left
        if (event.keyCode == 38) cameraZ -= 0.1; // Up
        if (event.keyCode == 39) cameraX += 0.1; // Right
        if (event.keyCode == 40) cameraZ += 0.1; // Down
        glMatrix.mat4.lookAt(
            viewMatrix,
            [cameraX, cameraY, cameraZ],    // the location of the eye or the camera
            [cameraX, 0.0, -10],        // the point where the camera look at
            [0.0, 1.0, 0.0]
        );
        gl.uniformMatrix4fv(uView, false, viewMatrix);
    }
    function onKeyup(event) {
        if (event.keyCode == 32) freeze = false;
    }
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
    
    // SPECULAR
    var uSpecularConstant = gl.getUniformLocation(shaderProgram, "uSpecularConstant");
    var uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");
    gl.uniform3fv(uSpecularConstant, [1.0, 1.0, 1.0]);  // white light
    gl.uniform3fv(uViewerPosition, [cameraX, cameraY, cameraZ]);

    var uModel = gl.getUniformLocation(shaderProgram, "uModel");
    function render() {
        // Transformation
        var modelMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(modelMatrix, modelMatrix, rotationMatrix);
        gl.uniformMatrix4fv(uModel, false, modelMatrix);
        var normalModelMatrix = glMatrix.mat3.create();
        glMatrix.mat3.normalFromMat4(normalModelMatrix, modelMatrix);
        gl.uniformMatrix3fv(uNormalModel, false, normalModelMatrix);
        // Texture
        gl.activeTexture(gl.TEXTURE0);  // Enable texture unit0
        gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target
        // Set the texture unit 0 to the sampler
        uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
        if (!uSampler) {
            console.log("Failed to get the storage location of uSampler");
        }
        gl.uniform1i(uSampler, 0);
        // Rendering core
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var primitive = gl.TRIANGLES;
        var offset = 0;
        var nVertex = indices.length;
        gl.drawElements(primitive, nVertex, gl.UNSIGNED_SHORT, offset);
        requestAnimationFrame(render);
    }
    initTextures(render);
}