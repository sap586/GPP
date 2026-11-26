import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// axes.js

export function createGridAxes(scene)
{
	//
	// Coordinate Arrows
	//

	const axisLength = 60;
	
	const xArrow =
		new THREE.ArrowHelper(
			new THREE.Vector3(
				1,0,0
			),
			new THREE.Vector3(
				0,0,0
			),
			axisLength,
			0xff0000,
			4,
			2
		);

	scene.add(xArrow);

	//
	// Y
	//

	const yArrow =
		new THREE.ArrowHelper(
			new THREE.Vector3(
				0,0,-1
			),
			new THREE.Vector3(
				0,0,0
			),
			axisLength,
			0x00ffff,
			4,
			2
		);

	scene.add(yArrow);

	//
	// Z
	//

	const zArrow =
		new THREE.ArrowHelper(
			new THREE.Vector3(
				0,1,0
			),
			new THREE.Vector3(
				0,0,0
			),
			axisLength,
			0x00ff00,
			4,
			2
		);

	scene.add(zArrow);

	//
	// Coordinate Labels
	//

	function makeLabel(text,color)
	{
		const canvas =
			document.createElement("canvas");

		canvas.width = 256;
		canvas.height = 256;

		const ctx =
			canvas.getContext("2d");

		ctx.fillStyle = color;
		ctx.font = "180px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText(
			text,
			128,
			128
		);

		const texture =
			new THREE.CanvasTexture(
				canvas
			);

		const sprite =
			new THREE.Sprite(
				new THREE.SpriteMaterial({
					map: texture,
					transparent: true
				})
			);

		sprite.scale.set(
			12,
			12,
			1
		);

		return sprite;
	}

	//
	// X
	// Red
	//

	const xLabel =
		makeLabel(
			"X",
			"#ff0000"
		);

	xLabel.position.set(
		72,
		 0,
		 0
	);

	scene.add(xLabel);

	//
	// Y
	// Cyan
	//

	const yLabel =
		makeLabel(
			"Y",
			"#00ffff"
		);

	yLabel.position.set(
		 0,
		 0,
		-72
	);

	scene.add(yLabel);

	//
	// Z
	// Green
	//

	const zLabel =
		makeLabel(
			"Z",
			"#00ff00"
		);

	zLabel.position.set(
		 0,
		72,
		 0
	);

	scene.add(zLabel);

	//
	// Grid
	//
	scene.add(
		new THREE.GridHelper(
			100,
			20,
			0x4444ff,
			0x444444
		)
	);

	//
	// GRID MARKERS
	//

	function createGridLabel(text, x, z)
	{
		const canvas =
			document.createElement("canvas");

		canvas.width = 256;
		canvas.height = 128;

		const ctx =
			canvas.getContext("2d");

		ctx.fillStyle = "#ffffff";
		ctx.font = "56px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillText(
			text,
			128,
			64
		);

		const texture =
			new THREE.CanvasTexture(
				canvas
			);

		const sprite =
			new THREE.Sprite(
				new THREE.SpriteMaterial({
					map: texture,
					transparent: true
				})
			);

		sprite.scale.set(
			8,
			4,
			1
		);

		sprite.position.set(
			x,
			0,
			z
		);

		scene.add(sprite);
	}

	//
	// X AXIS MARKERS
	//

	for(let x=-50;x<=50;x+=10)
	{
		createGridLabel(
			x.toString(),
			x,
			58
		);
	}

	//
	// Y AXIS MARKERS
	//

	for(let y=-50;y<=50;y+=10)
	{
		createGridLabel(
			y.toString(),
			-58,
			-y
		);
	}

	//
	// MACHINE ENVELOPE MARKERS
	//

	createGridLabel(
		"-24",
		-24,
		0
	);

	createGridLabel(
		"+24",
		 24,
		 0
	);

	createGridLabel(
		"-24",
		 0,
		-24
	);

	createGridLabel(
		"+24",
		 0,
		 24
	);

	//
	// MIN / MAX
	//

	createGridLabel(
		"X MIN",
		-70,
		58
	);

	createGridLabel(
		"X MAX",
		 70,
		58
	);

	createGridLabel(
		"Y MAX",
		-58,
		-70
	);

	createGridLabel(
		"Y MIN",
		-58,
		 70
	);

	//
	// ORIGIN
	//

	createGridLabel(
		"(0,0)",
		0,
		0
	);
	
	return {
		xArrow,
		yArrow,
		zArrow,
		xLabel,
		yLabel,
		zLabel
	};
}