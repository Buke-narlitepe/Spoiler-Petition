let canvas = $("canvas");
let hidInput = $(".signature");

if (canvas[0]) {
    let ctx = canvas[0].getContext("2d");

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    let drawing = false;

    canvas.on("mousedown", (e) => {
        drawing = true;
        let x = e.clientX - canvas.offset().left;
        let y = e.clientY - canvas.offset().top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    canvas.on("mouseup", function () {
        drawing = false;
        let signaturePic = canvas[0].toDataURL("image/png");
        hidInput.val(signaturePic);
    });

    canvas.on("mousemove", (e) => {
        if (drawing == true) {
            let x = e.clientX - canvas.offset().left;
            let y = e.clientY - canvas.offset().top;

            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });
}
