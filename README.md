# patterns-web

[Online demo](http://tnec.io/projects/patterns-web)

`patterns-web` is a 100% in-browser app to visualise vertically stacked 2D nanostructures (van der Waals heterostructures, graphene multilayers, etc.).

### Features
- Show atoms and/or unit cells at different scales, making it easy to e.g. find moiré patterns visually
- Control layers' unit cell vectors, rotation, modify atomic composition
- Load VASP POSCAR files or specify the layers manually
- Save image as an SVG image

### Local installation
`git clone https://github.com/tnecio/patterns-web.git`
Now you can open the `index.html` file located in `patterns-web` directory with your browser.

### See also
[supercell-core](https://github.com/tnecio/supercell-core): a Python library to find moiré patterns and low-strain supercells (for quantum-mechanical calculations) in vertically stacked 2D nanostructures.
 

### Licensing
This software is licensed under AGPL (see `LICENSE`).

    patterns-web
    Copyright (C) 2021  Tomasz Necio <Tomasz.Necio@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

This software contains a copy of [KaTeX 0.12.0](https://github.com/KaTeX/KaTeX) which is avaliable under this MIT License (MIT) (see license text and copyright notice in `LICENSE_KATEX`).

This software contains a copy of [Vue.js 2.6.11](https://github.com/vuejs/vue) which is available under the MIT License (MIT) (see license text and copyright notice in `LICENSE_VUE`).