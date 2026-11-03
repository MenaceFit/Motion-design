/*
 * words_to_comp.jsx — After Effects (ExtendScript)
 * Crée une composition 1080x1920 avec un calque texte par mot de words.json
 * ([{"text","start","end","accent"}]), placé dans le temps, avec pop d'entrée par expression.
 *
 * Exécution : Fichier > Scripts > Exécuter le fichier de script…
 * NON TESTÉ dans AE depuis le conteneur cloud (AE indisponible) — à valider.
 */
(function () {
    // ---- Réglages ----
    var FONT = "Montserrat-BlackItalic";     // nom PostScript
    var COLOR = [0.957, 0.925, 1.0];         // #f4ecff
    var ACCENT = [1.0, 0.239, 0.353];        // #ff3d5a
    var STROKE = [0.102, 0.031, 0.125];      // #1a0820
    var W = 1080, H = 1920, FPS = 30;
    var MAX_W = W * 0.78;

    var f = File.openDialog("Choisir words.json", "*.json");
    if (!f) return;
    f.encoding = "UTF-8"; f.open("r"); var raw = f.read(); f.close();
    var words = eval("(" + raw + ")"); // ExtendScript (ES3) n'a pas JSON natif ; fichier local de confiance
    if (!words.length) { alert("words.json vide"); return; }

    app.beginUndoGroup("Words to comp");
    var dur = words[words.length - 1].end + 0.6;
    var comp = app.project.items.addComp("KINETIC_WORDS", W, H, 1, dur, FPS);

    var bg = comp.layers.addSolid([0.078, 0.024, 0.102], "BG", W, H, 1);
    var popExpr = [
        "var t = time - inPoint, amp = .28, freq = 3.2, decay = 7.5, s0 = 72;",
        "if (t < 0) { [s0, s0]; } else {",
        "var s = 100 - (100 - s0) * Math.cos(freq * t * 2 * Math.PI) * Math.exp(-decay * t);",
        "var d = linear(time, inPoint, outPoint, 1, 1.05); [s * d, s * d]; }"
    ].join("\n");

    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var lyr = comp.layers.addText(w.text);
        var prop = lyr.property("Source Text");
        var doc = prop.value;
        doc.resetCharStyle();
        doc.font = FONT;
        doc.fontSize = Math.min(240, MAX_W / (Math.max(3, w.text.length) * 0.74));
        doc.fillColor = w.accent ? ACCENT : COLOR;
        doc.applyStroke = true; doc.strokeColor = STROKE; doc.strokeWidth = doc.fontSize * 0.05;
        doc.strokeOverFill = false;
        doc.justification = ParagraphJustification.CENTER_JUSTIFY;
        prop.setValue(doc);
        // centrage par l'ancre
        var r = lyr.sourceRectAtTime(0, false);
        lyr.property("Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
        lyr.property("Position").setValue([W / 2, H / 2]);
        lyr.property("Scale").expression = popExpr;
        lyr.inPoint = w.start;
        lyr.outPoint = Math.max(w.end, w.start + 4 / FPS);
        // ombre portée dure
        var ds = lyr.property("Effects").addProperty("ADBE Drop Shadow");
        ds.property("Shadow Color").setValue(STROKE);
        ds.property("Opacity").setValue(255);
        ds.property("Direction").setValue(180);
        ds.property("Distance").setValue(doc.fontSize * 0.06);
        ds.property("Softness").setValue(0);
        // marqueur pour aligner les SFX
        lyr.property("Marker").setValueAtTime(w.start, new MarkerValue(w.accent ? "ACCENT" : "word"));
    }
    bg.moveToEnd();
    comp.openInViewer();
    app.endUndoGroup();
    alert(words.length + " mots placés dans KINETIC_WORDS");
})();
