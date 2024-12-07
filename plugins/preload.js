/*
 * @Author: Eric-Chen1990 842436130@qq.com
 * @Date: 2023-01-19 13:13:57
 * @LastEditors: Eric-Chen1990 842436130@qq.com
 * @LastEditTime: 2023-01-19 14:06:26
 * @Description: Preload plugin. Cube and multiresolution are supported.
 */
function krpanoplugin() {
	var local = this;
	var krpano, path, plugin;
	const previewArray = [];
	const tilesArray = [];

	local.registerplugin = function (krpanointerface, pluginpath, pluginobject) {
		krpano = krpanointerface;
		path = pluginpath;
		plugin = pluginobject;

		plugin.registerattribute("maxlevel", null);
		plugin.percentage = 0;

		preloadStart();
	};

	function preloadStart() {
		const sceneArray = krpano.scene.getArray();

		sceneArray.forEach((scene) => {
			// get preview url
			if (scene.content.match(/preview\s+url=\".*.\"/)) {
				const preview = scene.content
					.match(/preview\s+url=\".*.\"/)[0]
					.match(/\".*.\"/)[0]
					.replace(/\"/g, "");
				previewArray.push(preview);
			}

			// get cube url
			let pano = null;
			let cube = scene.content.match(/cube\s+url=\".*.\"/);
			cube && (pano = cube[0]);
			if (pano) {
				pano = pano.match(/\".*.jpg\"/)[0].replace(/\"/g, "");

				if (cube) {
					const cubelabels = ["l", "f", "r", "b", "u", "d"];
					cubelabels.forEach((label) => {
						const cubeface = pano.replace(/%s/g, label);
						getTiles(scene, cubeface);
					});
				} else {
					getTiles(scene, pano);
				}
			}
		});

		const allImages = previewArray.concat(tilesArray);
		preload_images(allImages);
	}

	function getTiles(scene, pano) {
		const multiresArray = scene.content.match(/multires=\".*.\"/);
		if (!multiresArray) {
			tilesArray.push(pano);
			return;
		}
		const multires = multiresArray[0];
		const TILESIZE = multires.match(/[0-9]+/)[0];
		let LEVELSIZE_ARRAY = multires.match(/[0-9]+x[0-9]+/g);

		if (!LEVELSIZE_ARRAY) {
			LEVELSIZE_ARRAY = multires
				.match(/[0-9]+/g)
				.filter((v, i) => i !== 0)
				.map((v) => `${v}x${v}`);
		}

		LEVELSIZE_ARRAY.forEach((level, i) => {
			if (
				i <
				(plugin.maxlevel && plugin.maxlevel <= LEVELSIZE_ARRAY.length
					? plugin.maxlevel
					: LEVELSIZE_ARRAY.length)
			) {
				const l = i + 1;
				const url_l = pano.replace(/%l/g, l);
				const [frame_width, frame_height] = level.split("x");

				const v_levels = Math.ceil(frame_height / TILESIZE);
				const h_levels = Math.ceil(frame_width / TILESIZE);

				for (let v = 1; v <= v_levels; v++) {
					const url_v = url_l.replace(
						/%v/g,
						`${v_levels > 9 && v < 10 ? "0" : ""}${v}`
					);
					for (let h = 1; h <= h_levels; h++) {
						const url_h = url_v.replace(
							/%h/g,
							`${h_levels > 9 && h < 10 ? "0" : ""}${h}`
						);
						tilesArray.push(url_h);
					}
				}
			}
		});
	}

	function preload_images(arr) {
		let images = new Array();
		let loadedCount = 0;
		const updateProgress = () => {
			loadedCount++;
			const percentage = Number(((loadedCount / arr.length) * 100).toFixed(2));
			preload_progress(percentage);
		};

		for (i = 0; i < arr.length; i++) {
			images[i] = new Image();
			images[i].src = arr[i];
			images[i].onload = () => {
				updateProgress();
			};
			images[i].onerror = () => {
				updateProgress();
			};
		}
	}

	function preload_progress(percentage) {
		plugin.percentage = percentage;
		plugin.triggerevent("onloading");
	}
}
