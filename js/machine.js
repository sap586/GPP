import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// covers.js

export function createMachine(scene, rotationDeg = 0)
{
	//
	// Machine
	//

	const machine = new THREE.Group();
	scene.add(machine);

	machine.rotation.y = THREE.MathUtils.degToRad(rotationDeg);

	//
	// Materials
	//

	const frameMaterial =
		new THREE.MeshStandardMaterial({
			color: 0x404040,
			metalness: 0.8,
			roughness: 0.3
		});

	const coverMaterial =
		new THREE.MeshStandardMaterial({
			color: 0xd0d0d0,
			metalness: 0.4,
			roughness: 0.5,
			side: THREE.DoubleSide
		});

	//
	// Hex Corner Points
	//

	const pts = [

		[-20, 24],
		[ 20, 24],
		[ 32,  0],
		[ 20,-24],
		[-20,-24],
		[-32,  0]

	];

	//
	// Beam Helper
	//

	function createBeam(
		x1,y1,z1,
		x2,y2,z2,
		size = 2
	)
	{
		const v1 =
			new THREE.Vector3(
				x1,y1,z1
			);

		const v2 =
			new THREE.Vector3(
				x2,y2,z2
			);

		const dir =
			new THREE.Vector3()
				.subVectors(v2,v1);

		const length =
			dir.length();

		const beam =
			new THREE.Mesh(
				new THREE.BoxGeometry(
					size,
					size,
					length
				),
				frameMaterial
			);

		beam.position.copy(
			v1.clone()
			  .add(v2)
			  .multiplyScalar(0.5)
		);

		beam.quaternion
			.setFromUnitVectors(
				new THREE.Vector3(
					0,0,1
				),
				dir.normalize()
			);

		machine.add(beam);

		return beam;
	}

	//
	// FRONT HEX FRAME
	//

	for(let i=0;i<6;i++)
	{
		const a = pts[i];
		const b = pts[(i+1)%6];

		createBeam(
			a[0],a[1],24,
			b[0],b[1],24
		);
	}

	//
	// REAR HEX FRAME
	//

	for(let i=0;i<6;i++)
	{
		const a = pts[i];
		const b = pts[(i+1)%6];

		createBeam(
			a[0],a[1],-24,
			b[0],b[1],-24
		);
	}

	//
	// CONNECTING MEMBERS
	//

	for(let i=0;i<6;i++)
	{
		const p = pts[i];

		createBeam(
			p[0],
			p[1],
			24,

			p[0],
			p[1],
			-24
		);
	}

	//
	// COVERS
	//

	const covers = new THREE.Group();
	machine.add(covers);

	const panelMaterial =
		new THREE.MeshStandardMaterial({
			color: 0xd0d0d0,
			metalness: 0.3,
			roughness: 0.5,
			side: THREE.DoubleSide
		});

	//
	// FRONT HEX COVER
	//

	function createHexPanel()
	{
		const shape = new THREE.Shape();

		shape.moveTo(-20, 24);
		shape.lineTo(20, 24);
		shape.lineTo(32, 0);
		shape.lineTo(20, -24);
		shape.lineTo(-20, -24);
		shape.lineTo(-32, 0);
		shape.closePath();

		return new THREE.Mesh(
			new THREE.ExtrudeGeometry(
				shape,
				{
					depth: 0.25,
					bevelEnabled: false
				}
			),
			panelMaterial
		);
	}

	const frontCover =
		createHexPanel();

	frontCover.position.z = 24;

	covers.add(frontCover);

	//
	// REAR HEX COVER
	//

	const rearCover =
		createHexPanel();

	rearCover.rotation.y =
		Math.PI;

	rearCover.position.z =
		-24.25;

	covers.add(rearCover);

	//
	// TOP COVER
	//

	const topCover =
		new THREE.Mesh(
			new THREE.BoxGeometry(
				40,
				0.5,
				48
			),
			panelMaterial
		);

	topCover.position.set(
			0,
		   24,
			0
	);

	covers.add(topCover);

	//
	// BOTTOM COVER
	//

	const bottomCover =
		new THREE.Mesh(
			new THREE.BoxGeometry(
				40,
				0.5,
				48
			),
			panelMaterial
		);

	bottomCover.position.set(
			0,
		  -24,
			0
	);

	covers.add(bottomCover);

	//
	// LEFT UPPER SIDE PANEL
	//

	const leftUpper =
		new THREE.Mesh(
			new THREE.BufferGeometry(),
			panelMaterial
		);

	leftUpper.geometry.setAttribute(
		'position',
		new THREE.BufferAttribute(
			new Float32Array([

				-20,24, 24,
				-32, 0, 24,
				-20,24,-24,

				-32, 0,24,
				-32, 0,-24,
				-20,24,-24

			]),
			3
		)
	);

	leftUpper.geometry.computeVertexNormals();

	covers.add(leftUpper);

	//
	// LEFT LOWER SIDE PANEL
	//

	const leftLower =
		new THREE.Mesh(
			new THREE.BufferGeometry(),
			panelMaterial
		);

	leftLower.geometry.setAttribute(
		'position',
		new THREE.BufferAttribute(
			new Float32Array([

				-32, 0,24,
				-20,-24,24,
				-32, 0,-24,

				-20,-24,24,
				-20,-24,-24,
				-32, 0,-24

			]),
			3
		)
	);

	leftLower.geometry.computeVertexNormals();

	covers.add(leftLower);

	//
	// RIGHT UPPER SIDE PANEL
	//

	const rightUpper =
		leftUpper.clone();

	rightUpper.scale.x = -1;

	covers.add(rightUpper);

	//
	// RIGHT LOWER SIDE PANEL
	//

	const rightLower = leftLower.clone();
	rightLower.scale.x = -1;
	covers.add(rightLower);
	
	
		
		
    return {
		machine,
        covers,
        frontCover,
        rearCover,
        leftUpper,
        leftLower,
        rightUpper,
        rightLower,
        topCover,
        bottomCover
    };
}