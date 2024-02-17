class Button {
    constructor(x, y, w, h, label, callback) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.label = label;
        this.callback = callback;
        this.isHovering = false;      
        this.isActive = false;  
        this.isSelected = false;
    }

    select(isSelected) {
        this.isSelected = isSelected;
    }

    draw() {
        push();
        fill(255);

        if (this.isHovering) {
            fill(200);
        }

        if (this.isActive) {
            fill(150);
        }

        if (this.isSelected) {
            // set yellow
            fill(255, 255, 0);
        }

        rect(this.x, this.y, this.w, this.h);
        fill(0);
        textSize(20);
        textAlign(CENTER, CENTER);
        text(this.label, this.x + this.w / 2, this.y + this.h / 2);
        pop();
    }

    hover() {
        if (
            mouseX > this.x &&
            mouseX < this.x + this.w &&
            mouseY > this.y &&
            mouseY < this.y + this.h
        ) {
            this.isHovering = true;
        } else {
            this.isHovering = false;
        
        }
    }

    clicked() {
        if (this.isHovering) {
            this.isActive = true;
            this.callback(this);
            return true;
        }
        return false;
    }
}
