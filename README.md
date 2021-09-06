# edgeDec

## Overview

Website to run and display different WebGPU compute shaders chained together.

## Elements

### Usage

Drag an element to move it, to move all elements drag the background. To create a Connection drag an element 
with the control key pressed and drag the connection to the destination. If the connection already exist it will be removed instead.

### Inputs

Inputs use the webcam or files as external sources without other elements as inputs or other parameters.
The display size can be changed with the mouse wheel.
Supported file formats are 'png', 'jpg', 'jpeg' and 'jfif' for images and 'mp4', 'm4v' and 'webm' for videos.

### Shaders

Predefined shaders calculate there result with a predefined program, one or more inputs and sometimes parameters.

Matrix shaders calculate there result with a convolution matrix, one input and zero parameter. '-' and '+' change the matrix size and '~' changes the result normalization to include negative results.

### Displays

Displays draw one input to the screen, they can be used as an input again. The display size can be changed with the mouse wheel.

## Templates

Templates add multiple shaders and connect them. They have no differences to manual added shaders.
