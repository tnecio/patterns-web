function get_random_color() {
    var h = 1 + Math.random() * (360 - 1);
    var s = 100;
    var l = 30;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

var colors = [];
for (var i = 1; i < 300; i++) {
    colors.push(get_random_color());
}

Vue.component('atom', {
    props: ['data', 'index', 'transform', 'retransform', 'r'],
    // retransform is used to transform back to normal coordinates so that circles are circles
    // transform is used to move positions again to where they should be in the transformed pattern
    template: `
    <g>
        <circle :cx='getX(transform, data, 0, 0)' :cy='getY(transform, data, 0, 0)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <!-- deal with overflow:visible being broken -->
        <circle :cx='getX(transform, data, 1, 0)' :cy='getY(transform, data, 1, 0)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, 0)' :cy='getY(transform, data, -1, 0)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 0, 1)' :cy='getY(transform, data, 0, 1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 0, -1)' :cy='getY(transform, data, 0, -1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 1, 1)' :cy='getY(transform, data, 1, 1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 1, -1)' :cy='getY(transform, data, 1, -1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, 1)' :cy='getY(transform, data, -1, 1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, -1)' :cy='getY(transform, data, -1, -1)' :r='r' :fill="getColor(data)" :transform="'matrix (' + retransform + ')'"></circle>
    </g>
`,
    methods: {
        getX: function (transform, data, xoffset, yoffset) {
            const v = transform.split(" ").map(x => Number(x));
            const x = Number(data.x) + Number(xoffset);
            const y = Number(data.y) + Number(yoffset);
            return v[0] * x + v[2] * y;
        },

        getY: function (transform, data, xoffset, yoffset) {
            const v = transform.split(" ").map(x => Number(x));
            const x = Number(data.x) + Number(xoffset);
            const y = Number(data.y) + Number(yoffset);
            return v[1] * x + v[3] * y;
        },

        getColor: function (data) {
            return colors[data.el];
        }
    }
})

Vue.component('layerPattern', {
    props: ['data', 'index', 'settings'],
    template: `
<pattern :id="'layer' + index" :width="1 / settings.scale" :height="1 / settings.scale" viewBox="0 0 1 1" overflow="visible" :patternTransform="'rotate(' + data.rotation + ' 50 50) matrix(' + getTransformMatrix() + ')'">
    <atom
        v-if="settings.showAtoms" 
        v-for="(atom, atomIndex) in data.atoms"
        v-bind:key="atomIndex" v-bind:index="atomIndex" v-bind:data="atom"
        v-bind:transform="getTransformMatrix()"
        v-bind:retransform="getInverseTransformMatrix()"
        v-bind:r="settings.dotScale * 0.01"
    ></atom>
    <g v-if="settings.showCells">
        <line x1="0" y1="0" x2="1" y2="0" stroke="gray" stroke-width="0.025"></line>
        <line x1="0" y1="0" x2="0" y2="1" stroke="gray" stroke-width="0.025"></line>
    </g>
</pattern>
`,
    methods: {
        getVecs: function () {
            const v1x = this.data.cell[0].x;
            const v1y = this.data.cell[0].y;
            const v2x = this.data.cell[1].x;
            const v2y = this.data.cell[1].y;
            return [[v1x, v1y], [v2x, v2y]];
        },

        det: function (v) {
            return -(v[0][0] * v[1][1] - v[0][1] * v[1][0]);
        },

        getTransformMatrix: function () {
            const v = this.getVecs();
            return [v[0][0], -v[0][1], v[1][0], -v[1][1], 0, 0].join(" "); // -y because direction y on screen = -direction y in math
        },

        getInverseTransformMatrix: function () {
            const v = this.getVecs();
            const determinant = this.det(v);
            return [-v[1][1], v[0][1], -v[1][0], v[0][0], 0, 0].map((val) => val / determinant).join(" ");
        }
    }
});

Vue.component('layerRect', {
    props: ['index'],
    template: `<rect x="0" y="0" width="100" height="100" :fill="'url(#layer' + index + ')'"></rect>`
})

Vue.component('atomControl', {
    props: ['data', 'index'],
    created () {
        this.PERIODIC_TABLE = PERIODIC_TABLE;
        this.colors = colors;
    },
    template: `
<tr class="atomControl">
<td :style="'color: ' + colors[data.el]">
    {{ PERIODIC_TABLE[data.el] }}
</td><td>
    <label for="x">$$x$$  <input v-model="data.x" name="x" type="number" min="0" max="1" step="0.01"></label>
    <label for="y">$$y$$  <input v-model="data.y" name="y" type="number" min="0" max="1" step="0.01"></label>
    <button @click="$emit('remove-atom', index)">❌</button>
</td>
</tr>
`
})

Vue.component('layerControl', {
    props: ['l', 'index'],

    created () {
        this.PERIODIC_TABLE = PERIODIC_TABLE;
    },

    data: function() { return {
        el: null,
        atomsHidden: false
    }; },

    template: `
<div class="layerControl">
    <form novalidate class="layerPropertiesControl">
        <h4 v-if="l.name">
            {{ l.name }}
            <button @click="$emit('remove-layer', index)" type="button">🚫 Remove layer</button>
            <button @click="$emit('clone-layer', index)" type="button">🌟 Clone layer</button>
        </h4>
        <label for="v00">$$v_1^x$$ (Å) <input v-model="l.cell[0].x" name="v00" type="number" step="0.1"></label>
        <label for="v01">$$v_1^y$$ (Å) <input v-model="l.cell[0].y" name="v01" type="number" step="0.1"></label>
        <label for="v10">$$v_2^x$$ (Å) <input v-model="l.cell[1].x" name="v10" type="number" step="0.1"></label>
        <label for="v11">$$v_2^y$$ (Å) <input v-model="l.cell[1].y" name="v11" type="number" step="0.1"></label>
        
        <label for="rot">Rotation (°) <input v-model="l.rotation" name="rot" type="number" step="0.2"></label>
    </form>
    
    <hr>
    
    <form novalidate>
        <a href="javascript:void(0)" @click="toggleAtomsHidden()">{{ atomsHidden ? '▷' : '▽' }} Atoms</a>
        <table class="atomsControl" v-bind:class="{ hidden: atomsHidden }">
            <atomControl
                v-for="(atom, index) in l.atoms"
                v-bind:key="index" v-bind:index="index" v-bind:data="atom"
                @remove-atom="removeAtom"
            ></atomControl>
        </table>
    </form>
    
    <form v-on:submit.prevent="addAtom()" v-bind:class="{ hidden: atomsHidden }">
        <input v-model="el" id="el" name="el" type="text" :placeholder="'Element (Z/symbol)'">
        <button type="submit" title="Add atom" :disabled="!el">➕ Add atom</button> <!-- TODO: make it show error if el is empty -->
        <span style="color:red;" v-if="el && !inputIsElement()">No such element</span>
    </form>
    
</div>    
`,

    methods: {
        inputIsElement: function() {
            const el = this.el;
            return (el > 0 && el < 119 && Number.isInteger(Number(el))) || (PERIODIC_TABLE.indexOf(el) !== -1);
        },

        addAtom: function () {
            if (!this.inputIsElement()) {
                return;
            }
            var Z = Number(this.el);
            if (isNaN(Z)) {
                Z = PERIODIC_TABLE.indexOf(this.el);
                if (Z === -1) {
                    return;
                }
            }
            this.l.atoms.push({el: Z, x: 0, y: 0, z: 0});
        },

        removeAtom: function (index) {
            this.l.atoms.splice(index, 1);
        },

        toggleAtomsHidden: function () {
            this.atomsHidden = !this.atomsHidden;
        }
    }
})

let lp = new Vue({
    el: "#lp",

    created () {
        this.parsePoscar = parsePoscar;
    },

    data: {
// {
//     name: "Sample Layer",
//         height: 1,
//     atoms: [
//     {el: 6, x: 0, y: 0, z: 0}
// ],
//     cell: [
//     {x: 1, y: 0},
//     {x: 0, y: 1}
// ],
//     rotation: 0
// }
        layers: [{
            name: "Graphene",
            height: 1,
            atoms: [
                {el: 6, x: 0, y: 0, z: 0},
                {el: 6, x: 0.667, y: 0.667, z: 0}
            ],
            cell: [
                {x: 2.13, y: 1.23},
                {x: 2.13, y: -1.23}
            ],
            rotation: 0
        }],

        settings: {
            showAtoms: true,
            showCells: true,
            scale: 10,
            dotScale: 5
        },

        inputs: {
            poscar: "",
            poscarSpecies: "",
            layerName: null
        },

        messages: {
            poscarError: ""
        }
    },

    template: `
<main>
    <figure>
        <svg id="svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: white">
            <!-- Apply a transform on the tile -->
            <g id="layers">
                <layerPattern
                v-for="(layer, index) in this.layers"
                v-bind:key="index" v-bind:index="index" v-bind:data="layer" v-bind:settings="settings">
                </layerPattern>
            </g>

            <!-- Apply the transformed pattern tile -->
            <g id="rects">
                <layerRect v-for="(layer, index) in this.layers" v-bind:key="index" v-bind:index="index"></layerRect>
            </g>
        </svg>
        <figcaption>
            <button @click="downloadSvg()">↓ Download SVG image</button>
        </figcaption>
    </figure>

    <nav>
        <header style="display: flex; justify-content: space-between; margin-bottom: 2em;">
            <h2 style="margin: 0 auto;">2D materials patterns</h2>
            <a href="https://github.com/tnecio/supercell-core">Github</a>
        </header>
        <form>
            <label for="showAtoms">Show Atoms<input type="checkbox" v-model="settings.showAtoms" id="showAtoms" name="showAtoms"></label>
            <label for="showCells">Show Cells<input type="checkbox" v-model="settings.showCells" id="showCells" name="showCells"></label>
            
            <input type="range" id="scale" name="scale" min="1" max="50" style="width: 30em;" v-model="settings.scale">
            <label for="scale">Scale</label> {{ settings.scale }}
            <input type="range" id="scale" name="dotScale" min="1" max="20" v-model="settings.dotScale">
            <label for="dotScale">Atom dot's scale</label> {{ settings.dotScale }}
        </form>
    
        <br>
        
        <layerControl
            v-for="(layer, index) in this.layers"
            v-bind:key="index" v-bind:index="index" v-bind:l="layer"
            @remove-layer="removeLayer" @clone-layer="cloneLayer"
        ></layerControl>
        <input type="text" name="layerName" v-model="inputs.layerName" :placeholder="'Layer name'">
        <button @click="addLayer()">➕ Add layer</button>
        
        <hr>
        
        <div id="poscar">
            <h4>Load layer from a <a href="https://www.vasp.at/wiki/index.php/POSCAR" target="_blank">VASP POSCAR</a></h4>
            <span style="color:red;" v-if="this.messages.poscarError">{{ messages.poscarError }} <br></span>
            <label for="poscarArea">Paste POSCAR content here:
                <textarea name="poscarArea" v-model="inputs.poscar"></textarea>
            </label>
            <br>
            <label for="poscarSpecies">Atomic elements (if not supplied in the POSCAR, as a SPACE-separated list of symbols):
                <input type="text" name="poscarSpecies" v-model="inputs.poscarSpecies">
            </label>
            <br>
            <button @click="loadPoscar()" :disabled="!inputs.poscar">↑ Load</button>
            <br>
            Note: we ignore $$v_1^z, v_2^z,$$ and $$v_3$$ in the parsing.
        </div>
    </nav>
</main>
`,

    methods: {
        downloadSvg: function () {
            const text = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
                "<svg width=\"800\" height=\"800\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background-color: white\">" +
                document.getElementsByTagName("svg")[0].innerHTML +
                "</svg>";
            const filename = "patterns.svg"

            let element = document.createElement('a');
            element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        },

        addLayer: function () {
            this.layers.push({
                name: "New Layer",
                height: 1,
                atoms: [],
                cell: [
                    {x: 1, y: 0},
                    {x: 0, y: 1}
                ],
                rotation: 0
            });
        },

        loadPoscar: function () {
            try {
                let res = parsePoscar(this.inputs.poscar, this.inputs.poscarSpecies.trim().split(/\s+/));
                if (res.error !== undefined) {
                    this.messages.poscarError = res.error;
                } else {
                    this.messages.poscarError = "";
                    this.layers.push(res);
                }
            } catch (e) {
                console.log(e);
                this.messages.poscarError = "Can't parse POSCAR";
            }
        },

        removeLayer: function (index) {
            this.layers.splice(index, 1);
        },

        cloneLayer: function (index) {
            let newLayer = JSON.parse(JSON.stringify(this.layers[index])); // deep-copy trick
            newLayer.name = newLayer.name + "'";
            this.layers.push(newLayer);
        }
    }
})