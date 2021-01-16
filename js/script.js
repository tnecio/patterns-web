Vue.component('atom', {
    props: ['data', 'index', 'transform', 'retransform'],
    // retransform is used to transform back to normal coordinates so that circles are circles
    // transform is used to move positions again to where they should be in the transformed pattern
    template: `
    <g>
        <circle :cx='getX(transform, data, 0, 0)' :cy='getY(transform, data, 0, 0)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <!-- deal with overflow:visible being broken -->
        <circle :cx='getX(transform, data, 1, 0)' :cy='getY(transform, data, 1, 0)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, 0)' :cy='getY(transform, data, -1, 0)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 0, 1)' :cy='getY(transform, data, 0, 1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 0, -1)' :cy='getY(transform, data, 0, -1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 1, 1)' :cy='getY(transform, data, 1, 1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, 1, -1)' :cy='getY(transform, data, 1, -1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, 1)' :cy='getY(transform, data, -1, 1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
        <circle :cx='getX(transform, data, -1, -1)' :cy='getY(transform, data, -1, -1)' r='0.05' fill="blue" :transform="'matrix (' + retransform + ')'"></circle>
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
        }
    }
})

Vue.component('layerPattern', {
    props: ['data', 'index', 'settings'],
    template: `
<pattern :id="'layer' + index" :width="settings.scale * 0.1" :height="settings.scale * 0.1" viewBox="0 0 1 1" overflow="visible" :patternTransform="'rotate(' + data.rotation + ' 50 50) matrix(' + getTransformMatrix() + ')'">
    <atom
        v-if="settings.showAtoms" 
        v-for="(atom, atomIndex) in data.atoms"
        v-bind:key="atomIndex" v-bind:index="atomIndex" v-bind:data="atom"
        v-bind:transform="getTransformMatrix()"
        v-bind:retransform="getInverseTransformMatrix()"
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
    template: `
<div class="atomControl">
    <label for="x">x  <input v-model="data.x" id="x" name="x" type="number" min="0" max="1" step="0.01"></label>
    <label for="y">y  <input v-model="data.y" id="y" name="y" type="number" min="0" max="1" step="0.01"></label>
    <button @click="$emit('remove-atom', index)">X</button>
</div>
`
})

Vue.component('layerControl', {
    props: ['data', 'index'],
    template: `
<div class="layerControl">
    <form novalidate class="layerPropertiesControl">
    <label for="v00">$$v_1^x$$ (Å) <input v-model="data.cell[0].x" id="v00" name="v00" type="number" step="0.1"></label>
    <label for="v01">$$v_1^y$$ (Å) <input v-model="data.cell[0].y" id="v01" name="v01" type="number" step="0.1"></label>
    <label for="v10">$$v_2^x$$ (Å) <input v-model="data.cell[1].x" id="v10" name="v10" type="number" step="0.1"></label>
    <label for="v11">$$v_2^y$$ (Å) <input v-model="data.cell[1].y" id="v11" name="v11" type="number" step="0.1"></label>
    
    <label for="rot">Rotation (°) <input v-model="data.rotation" id="rot" name="rot" type="number" step="1"></label>
    </form>
    
    <div class="atomsControl">
    <atomControl
        v-for="(atom, index) in data.atoms"
        v-bind:key="index" v-bind:index="index" v-bind:data="atom"
        @remove-atom="removeAtom"
    ></atomControl>
    <button @click="addAtom('C')">Add atom</button>
    <button @click="$emit('remove-layer', index)">Remove layer</button>
    </div>
</div>    
`,

    methods: {
        addAtom: function (specie) {
            this.data.atoms.push({el: specie, x: 0, y: 0, z: 0});
        },

        removeAtom: function (index) {
            this.data.atoms.splice(index, 1);
        }
    }
})

let lp = new Vue({
    el: "#lp",

    data: {
        layers: [
            {
                name: "Sample Layer",
                height: 1,
                atoms: [
                    {el: "C", x: 0, y: 0, z: 0}
                ],
                cell: [
                    {x: 1, y: 0},
                    {x: 0, y: 1}
                ],
                rotation: 0
            }
        ],
        settings: {
            showAtoms: true,
            showCells: true,
            scale: 1
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
    </figure>

    <nav>
    <label for="showAtoms">Show Atoms<input type="checkbox" v-model="settings.showAtoms" id="showAtoms" name="showAtoms"></label>
    <label for="showCells">Show Cells<input type="checkbox" v-model="settings.showCells" id="showCells" name="showCells"></label>

    <layerControl
        v-for="(layer, index) in this.layers"
        v-bind:key="index" v-bind:index="index" v-bind:data="layer"
        @remove-layer="removeLayer"
    ></layerControl>
    <button @click="addLayer()">Add layer</button>
    </nav>
</main>
`,

    methods: {
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
        removeLayer: function (index) {
            this.layers.splice(index, 1);
        }
    }
})