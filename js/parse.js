const PERIODIC_TABLE = [ "Unknown",
    "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al",
    "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe",
    "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y",
    "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb",
    "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd",
    "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir",
    "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac",
    "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No",
    "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl",
    "Mc", "Lv", "Ts", "Og"
];

function parsePoscar(s, species) {
    let res = {
        name: "Layer from POSCAR",
        height: 1,
        atoms: [],
        cell: [
            {x: 1, y: 0},
            {x: 0, y: 1}
        ],
        rotation: 0
    };

    let lines = s.split("\n");

    // 1. System name
    res.name = lines[0];

    // 2. Scale factor
    let scale = Number(lines[1]);

    // 3-5. Lattice vectors in Angstroms
    let vecs = [];
    for (let i = 0; i < 3; i++) {
        let v = lines[2 + i].trim().split(/\s+/).map(x => Number(x));
        if (v.length !== 3) {
            return {error: "Bad length of vector in line " + (i + 1) + ": " + v.length};
        }
        vecs.push(v);
    }
    res.cell[0].x = vecs[0][0];
    res.cell[0].y = vecs[0][1];
    res.cell[1].x = vecs[1][0];
    res.cell[1].y = vecs[1][1];
    res.height = vecs[2][2];

    // 6.
    let offset = 5;
    let line = lines[offset].trim().split(/\s+/);
    if (isNaN(Number(line[0]))) {
        // Optional: atomic species names
        species = line.map(x => PERIODIC_TABLE.indexOf(x)); // Convert to atomic numbers
        for (let i = 0; i < species.length; i++) {
            if (species[i] === -1) {
                return {error: "Bad species symbols in the file"};
            }
        }
        offset += 1;
    } else {
        // we need species from the second argument
        if (!species || !species[0]) {
            speciesPrompted = prompt("Atomic element symbols were not supplied in the POSCAR file. Please enter them here as a SPACE-separated list");
            if (speciesPrompted === null) {
                return {error: "Species not supplied"};
            }
            species = speciesPrompted.trim().split(/\s+/).map(x => PERIODIC_TABLE.indexOf(x));
        } else {
            const speciesZ = species.map(x => PERIODIC_TABLE.indexOf(x));
            for (let i = 0; i < speciesZ.length; i++) {
                if (speciesZ[i] === -1) {
                    return {error: "No such element symbol " + species[i]};
                }
            }
            species = speciesZ;
        }
    }

    // 7. Atomic species counts
    let counts = lines[offset].trim().split(/\s+/).map(x => Number(x));
    if (counts.length !== species.length) {
        return {error: "Species names and counts arrays lengths do not match"};
    }
    offset++;

    // 8. Optional: Selective dynamics
    if (lines[offset][0].toLowerCase() === "s") {
        offset++;
    }

    // 9. Cartesian or Direct
    if (lines[offset][0].toLowerCase() === "c" || lines[offset][0].toLowerCase() === "k") {
        return {error: "Cartesian coordinates not yet supported"};
    }
    offset++;

    // 10+. Atoms
    for (let i = 0; i < species.length; i++) {
        let el = species[i];
        let count = counts[i];
        for (let j = 0; j < count; j++) {
            let vec = lines[offset].trim().split(/\s+/).slice(0, 3).map(x => Number(x));
            let atom = { el: el, x: vec[0], y: vec[1], z: vec[2] };
            res.atoms.push(atom);
            offset++;
        }
    }

    return res;
}