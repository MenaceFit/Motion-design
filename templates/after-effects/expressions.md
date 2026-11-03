# Expressions After Effects — kinetic typography & motion graphics

> Moteur d'expressions JavaScript (défaut depuis AE 16.0). Non testées dans le conteneur
> (AE indisponible) : à valider dans AE, consigner tout problème dans la skill `after-effects`.

## 1. Pop d'entrée avec overshoot (Scale) — équivalent du pattern A1
```js
// À coller sur Scale. Démarre au In-point du calque.
var t = time - inPoint;
var amp = 0.28, freq = 3.2, decay = 7.5;   // overshoot, oscillations/s, amortissement
var startScale = 72;                         // % (≥ 70 pour rester lisible dès la 1re frame)
if (t < 0) { [startScale, startScale]; }
else {
  var s = 100 - (100 - startScale) * Math.cos(freq * t * 2 * Math.PI) * Math.exp(-decay * t);
  [s, s];
}
```

## 2. Inertial bounce sur keyframes existantes (Position / Scale / Rotation)
```js
// Rebond après la dernière keyframe passée (classique « inertial bounce »).
var amp = .06, freq = 2.5, decay = 6.0, n = 0;
if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) n--; }
if (n > 0) {
  var t = time - key(n).time;
  var v = velocityAtTime(key(n).time - thisComp.frameDuration / 10);
  value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
} else { value; }
```

## 3. Drift lent pendant la vie du calque (pattern A2)
```js
var p = linear(time, inPoint, outPoint, 100, 105);
[p, p];
```

## 4. Révélation mot à mot par marqueurs (pattern A3)
Texte > Animate > Opacity (0 %), Range Selector > Advanced > *Based on : Words*, *Mode : Add*.
Sur **Start** du Range Selector :
```js
// Un marqueur de calque par mot (placé au début de chaque mot prononcé).
var m = marker, n = 0;
for (var i = 1; i <= m.numKeys; i++) if (m.key(i).time <= time) n = i;
var words = text.sourceText.split(/\s+/).length;
// le mot n devient visible : on décale le début de la plage
var fade = linear(time, n ? m.key(n).time : 0, (n ? m.key(n).time : 0) + .12, 0, 1);
(Math.max(0, n - 1) + fade) / words * 100;
```

## 5. Compteur (pattern A6) — sur Source Text
```js
var start = 4000, end = 1000000;            // valeurs
var t0 = inPoint, t1 = inPoint + 1.5;       // durée du défilement
var v = Math.round(ease(time, t0, t1, start, end));
v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
```

## 6. Wiggle contrôlé et bouclable (vie de fond)
```js
var freq = 0.6, amp = 12, loopTime = 4;
var t = time % loopTime;
var w1 = wiggle(freq, amp, 1, .5, t), w2 = wiggle(freq, amp, 1, .5, t - loopTime);
linear(t, 0, loopTime, w1, w2);
```

## 7. Stroke draw (pattern A4)
Forme > Add > Trim Paths. Sur **End** :
```js
var d = 0.9; // secondes
var p = (time - inPoint) / d;
100 * (1 - Math.pow(1 - Math.min(Math.max(p, 0), 1), 4)); // easeOutQuart
```

## 8. Glow pulse en boucle (pattern A8) — sur Opacity
```js
80 + 20 * Math.sin(time * 2 * Math.PI / 1.6);
```
