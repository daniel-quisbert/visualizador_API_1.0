/**
 * Copyright (C) GeoBolivia
 *
 * This file is part of GeoBolivia API
 *
 * GeoBolivia API is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GeoBolivia API.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @fileoverview Create a simple map viewer from a WMC file
 * @author cperez@geo.gob.bo (Ariel Perez)
 * @author fvelasquez@geo.gob.bo (Rodolfo Velasquez)
 * @author slesage@geo.gob.bo (Sylvain Lesage)
 *
 * Modify by:
 * @author mquisbert@geo.gob.bo [Daniel Quisbert]
 */

/**
 * @requires OpenLayers/Map.js
 */

/*jslint browser: true*/
/*global OpenLayers*/

/*(function () {*/"use strict";

var init, map;

/*
 * Create size in pixel for CSS
 * ex: createSizePx('200') -> '200px'
 * @param {string} size size in pixels
 * @param {integer} offset offset in pixels
 * @return {string} size in the following format '200px'
 *                  if error: null
 */
function createSizePx(size, offset) {
	var intSize;
	offset = (offset) ? parseInt(offset, 10) : 0;
	intSize = parseInt(size, 10) + offset;
	return isNaN(intSize) ? null : intSize.toString() + 'px';
}

/*
 * Parse the page URL to find a parameter value
 * @param {string} name name of the parameter
 * @return {string} value of the parameter
 *                  if error: null
 */
function getUrlParameter(name) {
	var regexp, regexpRes, firstMatch, value;
	regexp = new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)');
	regexpRes = regexp.exec(location.search);
	firstMatch = (regexpRes || ["", ""])[1];
	value = decodeURIComponent(firstMatch.replace(/\+/g, '%20'));
	return value || null;
}

/**
 * A Configuration object
 * @constructor
 */
function Configuration() {
	this.wmcUrl = '';
	this.infoLayer = false;
	this.bgmap = "";
	this.bgmap2 = "";
	this.tools = "";
	this.tools_nav = "";
	this.newcolor="";
	this.tit_leyenda="Leyenda";
	//this.proxy = "/proxy/?url=";
	this.proxy = "/cgi-bin/proxy.cgi?url=";
	this.zdakar = '0';	// zdakar: variable sólo para los mapas del DAKAR
	
	
}

/**
 * Parse and validate the URL parameters
 */
Configuration.prototype.getUrlParameters = function() {
	this.infoLayer = (getUrlParameter('infoLayer') === "on") || this.infoLayer;
	this.bgmap = getUrlParameter('bgmap') || this.bgmap;
	this.bgmap2 = getUrlParameter('bgmap2') || this.bgmap2;
	this.tools = getUrlParameter('tools') || this.tools;
	this.tools_nav = getUrlParameter('tools_nav') || this.tools_nav;
	this.newcolor = getUrlParameter('newcolor') || this.newcolor;
	this.tit_leyenda = getUrlParameter('tit_leyenda') || this.tit_leyenda;
	this.wmcUrl = getUrlParameter('wmc') || this.wmcURL;
	this.wmcUrl = this.wmcUrl.replace(/www.geo.gob.bo/g, 'geo.gob.bo');	
	this.zdakar = getUrlParameter('zdakar') || this.zdakar;
};

/**
 * Function para establecer el color de la leyenda
 * de la barra de herramientas y el logo de GeoBolivia
 */
function hexToRgb(h){
    var a = parseInt((cutHex(h)).substring(0,2),16), b = parseInt((cutHex(h)).substring(2,4),16), c = parseInt((cutHex(h)).substring(4,6),16);
    return {
		r: a,
		g: b,
		b: c
	}   
}

function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1):h}

function setColorTitulo(color, titleyenda){
	var color2 = 'rgba('+ color.r +','+ color.g +','+ color.b +',0.8)';
	document.getElementById('attribution').style.background = color2;
	document.getElementById('measure').style.background = color2;
	document.getElementById('secLegend').style.background = color2;
	document.getElementById('secTools').style.background = color2;
	document.getElementById('cbp-spmenu-s1').style.background = color2;
	document.getElementById('cbp-spmenu-s2').style.background = color2;
	
	if(titleyenda!='')document.getElementById('tit_leyenda').textContent = titleyenda.toUpperCase();	
}


function replaceUrl(url, title) {
	var geoserver = "geoserver";
	//url = "http://geo.gob.bo/geoserver/udape/wms?SERVICE=WMS&";
	//title = "udape:TasaDeMortalidadInfantilPorMilNacidosVivos2001";
	var w = title.split(":");
	var newurl = url;
	var domain = "";
	//http
	if (newurl.indexOf("http") >= 0) {
		newurl = newurl.replace(/http:\/\//g, '');
		domain = "http://" + newurl.substring(0, newurl.indexOf("/"))
	} else if (newurl.indexOf("https") >= 0) {
		newurl = newurl.replace(/https:\/\//g, '');
		domain = "https://" + newurl.substring(0, newurl.indexOf("/"))
	}
	var url2 = newurl.substring(newurl.indexOf("/"));

	//SERVICE
	indW = url2.lastIndexOf("wms?");
	if (indW > 0) {
		url2 = url2.substring(0, indW);
	}
	//GEOWEBCACHE DE GEOSERVER
	indW = url2.lastIndexOf("gwc");
	if (indW > 0) {
		url2 = url2.substring(0, indW);
	}

	//WORKSPACE
	var indW = url2.lastIndexOf(w[0]);
	if (indW > 0) {
		newurl = url2.substring(0, indW);
	} else {
		newurl = url2;
	}
	return domain + newurl + "wms";
}

/**
 * Fill the #legend <div>
 */
function createLegend2() {
	var control, i, layer, url;
	if (map && document.getElementById('content_legend')) {
		for ( i = 1; i < map.layers.length; i += 1) {
			layer = map.layers[i];
			if (layer.getVisibility() && layer.params) {
				url = layer.url + "request=GetLegendGraphic&format=image%2Fpng&transparent=true&width=20&height=20&color=%23fff&layer=" + layer.params["LAYERS"];
				layer.name = cleanNameLayer(layer.name) + "<br><span style='vertical-align:middle;padding:auto;background-color:rgba(255,255,255,0.1);width:220px;position:absolute;margin-bottom:10px;'><img src='" + url + "'/></span><br>";
			}
		}
		control = new OpenLayers.Control.LayerSwitcher({
			'div' : OpenLayers.Util.getElement('content_legend')
		});
		map.addControl(control);
	}
}

/*
 * Show the line measurement within the #measure <div>
 * Units are in the metric system
 * @param {OpenLayers.Events} event Event of the line measurement
 */
function handleLineMeasure(event) {
	var element, out;
	element = document.getElementById('measure');
	out = "";
	if (event.order === 1) {
		/* Trick for the number format: http://stackoverflow.com/a/4689230 */
		out += "Longitud: " + event.measure.toPrecision(4) + " " + event.units;
	}
	element.innerHTML = out;
}

/*
 * Show the area measurement within the #measure <div>
 * Units are in the metric system
 * @param {OpenLayers.Events} event Event of the area measurement
 */
function handleAreaMeasure(event) {
	var element, out;
	element = document.getElementById('measure');
	out = "";
	if (event.order === 2) {
		/* Trick for the number format: http://stackoverflow.com/a/4689230 */
		out += "Superficie: " + Number(event.measure.toPrecision(4)) + " " + event.units + "<sup>2</sup>";
	}
	element.innerHTML = out;
}

/**
 * Fill the #tools <div>
 */
function createTools(conf) {
	var tools, icons, measure, panelCtl, fakePanCtl, navCtl, lineMeasureCtl, areaMeasureCtl;
	
	hiddenMeasure();
	tools = document.getElementById('tools');
	icons = document.getElementById('icons');
	measure = document.getElementById('measure');
	//if (map && conf.hasTools && tools && icons) {
		/* Controls */
		navCtl = new OpenLayers.Control.NavigationHistory({
			displayClass : 'hist'
		});
		navCtl.previous.title='Atrás';
		navCtl.next.title='Adelante';		
		
		fakePanCtl = new OpenLayers.Control({
			title: "Mover",
			displayClass : 'pan'
		});
		/* Controls panel */
		panelCtl = new OpenLayers.Control.Panel({
			'div' : icons,
			'defaultControl' : fakePanCtl
			//autoActivate: true
		});		
		/* Add to map */		
		map.addControl(navCtl);
		
		panelCtl.addControls([
			new OpenLayers.Control.ZoomToMaxExtent({title: "Vista Inicial"}),
		]);
		if(conf.tools_nav){			
			panelCtl.addControls([navCtl.previous,navCtl.next]);
		}
		
		panelCtl.addControls([	
			fakePanCtl,
			new OpenLayers.Control.ZoomIn({title: "Acercarse"}),
        	new OpenLayers.Control.ZoomOut({title: "Alejarse"})        	
        ]);
		
		if(conf.tools){			
			panelCtl.addControls([createBotonDistance(conf),createBotonArea(conf)]);
		}
				
		/*  Se crea el botón 'i' para mostrar la informacón de las capas en un popup
		 **/			
		if (conf.infoLayer) {			
			panelCtl.addControls([infoPopup()]);
		}
		map.addControl(panelCtl);
		verifyFullScreen(panelCtl);						
		
	//}
}
function hiddenMeasure(){
	// Ocultamos el contenedor Measure	
	document.getElementById('measure').style.display = 'none';
}
function showMeasure(){
	// Mostramos el contenedor Measure	
	document.getElementById('measure').style.display = 'block';
}

function createBotonDistance(conf){
	var lineMeasureCtl = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {					
					persist : true,
					immediate : true,					
				});
	map.addControl(lineMeasureCtl);
	lineMeasureCtl.events.on({			
					"measure" : handleLineMeasure,
					"measurepartial" : handleLineMeasure
				});	
				
	var btn = new OpenLayers.Control.Button({
		displayClass : 'path',
		type : OpenLayers.Control.TYPE_TOGGLE,
		title: 'Distancia',
		eventListeners : {
			'activate' : function() {
						if(map.controls[17]){							
							map.controls[15].deactivate();
							map.controls[16].deactivate();
							map.controls[17].deactivate();
						}else{
							if(map.controls[15]){	
								if(conf.infoLayer){								
									map.controls[13].deactivate();
								}																
								map.controls[14].deactivate();
								map.controls[15].deactivate();								
							}
							else{
								map.controls[13].deactivate();
								map.controls[12].deactivate();
							}
						}
						lineMeasureCtl.activate();
						showMeasure();
				},
			'deactivate' : function() {
				lineMeasureCtl.deactivate();
				hiddenMeasure();				
			}
		}
	});
	return btn;
}
function createBotonArea(conf){
	var areaMeasureCtl = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {			
			persist : true,
			immediate : true,			
		});
		map.addControl(areaMeasureCtl);
		areaMeasureCtl.events.on({
			"measure" : handleAreaMeasure,
			"measurepartial" : handleAreaMeasure
		});
				
	var btn = new OpenLayers.Control.Button({
		displayClass : 'polygon',
		type : OpenLayers.Control.TYPE_TOGGLE,
		title: 'Área',
		eventListeners : {
			'activate' : function() {
						// Popup son 2 controles
						if(map.controls[17]){							
							map.controls[14].deactivate();
							map.controls[16].deactivate();
							map.controls[17].deactivate();
						}						
						else{		
							if(map.controls[15]){
								if(conf.infoLayer){
									map.controls[14].deactivate();
									map.controls[12].deactivate();
								}else																
									map.controls[13].deactivate();
								map.controls[15].deactivate();	
							}
							else{
								map.controls[13].deactivate();
								map.controls[11].deactivate();
							}
						}
						areaMeasureCtl.activate();
						showMeasure();
				},
			'deactivate' : function() {
				areaMeasureCtl.deactivate();
				hiddenMeasure();				
			}
		}
	});
	return btn;
}

/**
 * Remove the ajaxloader image
 */
function removeAjaxLoader() {
	var ajaxloader;
	ajaxloader = document.getElementById('ajaxloader');
	if (ajaxloader) {
		ajaxloader.parentNode.removeChild(ajaxloader);
	}
}

/**
 * Load the context from the  WMC specified in the URL
 * A proxy may be necessary for that function
 * http://trac.osgeo.org/openlayers/wiki/FrequentlyAskedQuestions#HowdoIsetupaProxyHost
 * @param {Configuration} conf Configuration of the viewer
 */

function loadWmc(conf, protocol) {
	var request, urlObj, url;
	if (!conf.wmcUrl) {
		return;
	}
	urlObj = OpenLayers.Util.createUrlObject(conf.wmcUrl);
	if (!protocol) {
		protocol = urlObj.protocol;
	}
	url = protocol + '//' + urlObj.host;
	if (urlObj.port && urlObj.port !== "80") {
		url += ':' + urlObj.port;
	}
	url += urlObj.pathname;
	url = OpenLayers.Util.urlAppend(url, OpenLayers.Util.getParameterString(urlObj.args));

	request = OpenLayers.Request.GET({
		url : url,
		async : false,
		callback : function(request) {
			var extend, projection, format, context, i, MAP_SCALES, options, z, b;
			if (request.status < 200 || request.status >= 300) {
				return;
			}
			if (!request.responseText) {
				return;
			}
			format = new OpenLayers.Format.WMC();
			//OpenLayers.DOTS_PER_INCH = 90.71428571428572;
			var text = request.responseText;
			context = format.read(text);

			// Change the map scale
			MAP_SCALES = [4265.459166936, 8530.918333871, 17061.836667742, 34123.673335484, 68247.346670968, 136494.693341936, 272989.386683873, 545978.773367746, 1091957.546735491, 2183915.093470982, 4367830.186941965, 8735660.373883929];
			options = {
				scales : MAP_SCALES
			};
			map = new OpenLayers.Map("map", {
				div : 'map',
				//allOverlays : true,
				maxResolution : 196543.0339,
				restrictedExtent : extendOsmGoogle(context.bounds),
				units : context.units,
				maxExtent : extendOsmGoogle(context.bounds),
				numZoomLevels : 22,
				projection : new OpenLayers.Projection("EPSG:900913"),
				displayProjection : new OpenLayers.Projection("EPSG:4326"),
				controls: [
				new OpenLayers.Control.Navigation({
	                mouseWheelOptions: {
	                    cumulative: false,
	                    interval: 100
	                },
	                dragPanOptions: {
	                    enableKinetic: {
	                        deceleration: 0.02
	                }
	            }}),
				new OpenLayers.Control.ZoomBox()]
            });
			map.setOptions(options);
			// Validamos para que el usuario tenga que escoger si o si un fondo de mapa,
			// caso contrario se mostrara un mensaje indicando que debe escoger por lo menos uno. 
			if (backgroundMap(conf) == 0) {
				if (backgroundMap2(conf) == 0) {
					alert("Debe Seleccionar por lo menos un fondo de mapa!");
				}else{		
					map.addLayers(backgroundMap2(conf));
				}			
			}			
			else{
				map.addLayers(backgroundMap(conf));
				if (backgroundMap2(conf) != 0) {
					map.addLayers(backgroundMap2(conf));
				}					
			}

			for ( i = 0; i < map.layers.length; i += 1) {
				//map.layers[i].gutter = 10;
				map.layers[i].setTileSize(new OpenLayers.Size(256, 256));
				//map.layers[i].addOptions(options, true);
			}

			//Add Layers
			map.addLayers(getLayerWmc(text));
			createLegend2(conf);
			createTools(conf);
			removeAjaxLoader();

			z = 6;
			// z: nivel de ZOOM para los mapas
			b = context.bounds;
			if (conf.zdakar != "0") {
				if (conf.zdakar == "6") {
                    z = 15;
                } 
                else {
                    z = 16;
                }
                if (conf.zdakar == "5") {
                    z = 8;
                } 

                b = boundZdakar(conf.zdakar);

			}
			map.setCenter(b.getCenterLonLat(), z);
			// fondo de mapa con zoom de acuerdo a los boundingbox
			//map.zoomToExtent(extendOsmGoogle(context.bounds));
		}
	});
	return request;
}

/**
 * Función especial sólo para los WMC de las regiones del Dakar
 * para utilizarla se debe enviar la variable zdakar en el envio GET
 * osea, aumentar la variable (&amp;zdakar=1,2,3,4,5, donde 1,2,3,4 y 5 son las regiones de las cuales se 
 * desea obtener los bounds) en la propiedad 'href' del código generado
 * como en el siguiente ejemplo :
 *
 * http://geo.gob.bo/api/viewer.html?wmc=http:/geo.gob.bo/IMG/wmc/dakar.wmc&amp;bgmap=fondo_osm_mapnik&amp;zdakar=1
 *
 * Ajuste de los Bounds a los de las regiones del DAKAR, (Potosí, Tupiza, Uyuni, Villazón)
 */

function boundZdakar(zd) {
	var b;
	switch (zd) {
		case "1":
			// Bounds Potosi
			b = new OpenLayers.Bounds(-7320602.74929959979, -2224697.49292859994, -7318792.54567920044, -2223829.49119260022);
			break;
		case "2":
			// Bounds Tupiza
			b = new OpenLayers.Bounds(-7316226.49234179966, -2445124.33855020022, -7315502.41089360043, -2444777.13785579987);
			break;
		case "3":
			// Bounds Uyuni
			b = new OpenLayers.Bounds(-7439091.37992199976, -2328056.60538739990, -7438367.29847379960, -2327709.40469300002);
			break;
		case "4":
			// Bounds Villazón
			b = new OpenLayers.Bounds(-7302493.48005960044, -2522538.37589279981, -7301769.39861140028, -2522191.17519839993);
			break;
		case "5":
			// Bounds Regiónwa
			b = new OpenLayers.Bounds(-7676501.00000000, -2633883.00000000, -7248100.00000000, -2138282.00000000);
			break;
		case "6":
            // Bounds 
            b = new OpenLayers.Bounds(-7585697.00000000, -1865388.00000000, -7582232.00000000, -1861229.00000000);
            break;
	}
	return b;
}

function extendOsmGoogle(extendMap) {
	var nx, a;
	a = extendMap.toArray();
	a[0] = parseFloat(a[0]) + parseFloat(a[0]) * -0.011;
	a[1] = parseFloat(a[1]) + parseFloat(a[1]) * 0.0;
	a[2] = parseFloat(a[2]) + parseFloat(a[2]) * 0.0;
	a[3] = parseFloat(a[3]) + parseFloat(a[3]) * 0.0;
	nx = new OpenLayers.Bounds(a[0], a[1], a[2], a[3]);
	return nx;
}
/**
 * Función que devuelve el primer fondo de mapa
 */
function backgroundMap(conf) {
	var bmap = 0;
	switch (conf.bgmap) {
		case "fondo_osm_mapnik":
			bmap = new OpenLayers.Layer.OSM("Mapnik");
			break;
		case "fondo_osm_google_like":
			bmap = new OpenLayers.Layer.OSM("Google-like", ["http://a.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png", "http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png", "http://c.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png"], {
				"tileOptions" : {
					"crossOriginKeyword" : null
				}
			});
			break;
		case "fondo_osm_midnight_commander":
			bmap = new OpenLayers.Layer.OSM("Midnight Commander", ["http://a.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png", "http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png", "http://c.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png"], {
				"tileOptions" : {
					"crossOriginKeyword" : null
				}
			});
			break;
		case "fondo_google_streets":
			bmap = new OpenLayers.Layer.Google("Google Streets", {
				type : google.maps.MapTypeId.ROADMAP,
			});
			break;		
	}
	return [bmap];
}

/**
 * Función que devuelve el segundo fondo de mapa
 */
function backgroundMap2(conf) {
	var bmap2 = 0;
	switch (conf.bgmap2) {
		case "fondo_google_satellite":
			bmap2 = new OpenLayers.Layer.Google("Google Satellite", {
				type : google.maps.MapTypeId.SATELLITE,
			});
			break;
		case "fondo_google_hybrid":
			bmap2 = new OpenLayers.Layer.Google("Google Hybrid", {
				type : google.maps.MapTypeId.HYBRID,
			});
			break;
		case "fondo_osm_cyclemap":
			bmap2 = new OpenLayers.Layer.OSM.CycleMap("CycleMap");
			break;
		case "fondo_google_physical":
			bmap2 = new OpenLayers.Layer.Google("Google Physical", {
				type : google.maps.MapTypeId.TERRAIN,
			});
			break;				
	}
	return [bmap2];
}

function getLayerWmc(wmcString) {
	var wmcFormat = new OpenLayers.Format.WMC();
	var wmcReader = new GeoExt.data.WMCReader();
	var newContext = wmcFormat.read(wmcString, {});
	var c = 0;
	// get context from wmc
	// using non-API feature
	var layers = new Array();
	Ext.each(wmcReader.readRecords(newContext).records, function(r) {
		var la = new OpenLayers.Layer.WMS(r.get('layer').name, r.get('layer').url, {
			layers : r.get('title'),
			transparent : true,
		});
		la.setVisibility(r.get('layer').visibility);
		if (c > 0) {
			layers.push(la);
		}
		c++;
	});
	return layers;
}

/**
 * Create an OpenLayers map in the #map <div>
 */
function createMap(conf) {
	var request;
	request = loadWmc(conf);
	if (request.status < 200 || request.status >= 300 || !request.responseText) {
		// probamos en HTTP por si acaso
		request = loadWmc(conf, 'http:');
	}
}
/* Inserta un botón de infromación
 *  que muestra la información del lugar en un popup
 */

function infoPopup() {
	var info1, panel, popup, btnPopup;	
	info1 = new OpenLayers.Control.WMSGetFeatureInfo({
		infoFormat : 'application/vnd.ogc.gml',
		title : 'Información',
		queryVisible : true
	});
	map.addControl(info1);
	// register a listener for the getfeatureinfo event on the control
	info1.events.on({
		getfeatureinfo : function(info) {
			//if(popup)
			//	popup.destroy();
			
			var features = info.features;
			var layersStr = "<ul id='tapi'>";
			var model = [];
			var attributes = {};
			var nomLayer = "";
			layersStr += "<li style='font-size:10px;'><a href='#'> No existen datos para consultar </a></li>";
			if (features.length > 0) {
				for (var i = 0; i < features.length; i++) {
					attributes = features[i].attributes;
					var row = [];
					row.push(features[i].fid);
					for (var key in attributes) {
						var data = features[i].attributes[key];
						row.push(key);
						row.push(data);
					}
					model.push(row);
				}

				layersStr = "<ul id='tapi'>";
				row = "";
				for ( i = 0; i < model.length; i++) {
					row += "<li><a href='#'>" + cleanNameLayer(model[i][0]) + "</a><ul>";
					
					for (var j = 1; j < model[i].length; j = j + 2) {
						var cod = model[i][j].slice(0, 3);
						if ((cod != "cod") && (cod != "COD") && model[i][j + 1] != null) {
							
							row += "<li><a href='#'><b style='min-width:70px;text-transform:capitalize;'>";
							row += model[i][j];
							row += ": </b>";
							row += model[i][j + 1];
							row += "</a></li>";
						}
					}
					row += "</ul></li>";
				}
				layersStr += row + "</ul>";
			}
			popup = new GeoExt.Popup({
				title : "GeoBolivia",
				//location: event.xy,
				map : map,
				location : new OpenLayers.Geometry.Point(map.getLonLatFromPixel(info.xy).lon, map.getLonLatFromPixel(info.xy).lat),
				lonlat : map.getLonLatFromPixel(info.xy),
				autoScroll : true,
				collapsible : true,
				bodyStyle : {
					padding : 0
				},
				html : layersStr
			});
			popup.show();
		}
	});
	var btnPopup = new OpenLayers.Control.Button({
		displayClass : 'info',
		type : OpenLayers.Control.TYPE_TOGGLE,
		title: 'Información',
		eventListeners : {
			'activate' : function(){
				hiddenMeasure();
				if(map.controls[17]){
					map.controls[15].deactivate();
					map.controls[14].deactivate();
					map.controls[17].deactivate();
				}else{					
					if(map.controls[15]){
						map.controls[15].deactivate();
						map.controls[13].deactivate();
						map.controls[12].deactivate();
					}
					else{
						map.controls[11].deactivate();
					}
				}	
							
				
				info1.activate();
			},
			'deactivate' : function() {
				if(popup)
					popup.destroy();
				info1.deactivate();
				hiddenMeasure();				
			}
		}
	});
	return (btnPopup);
}

function cleanNameLayer(nom) {
	var t = 0;
	var name = "";
	var c = nom.charAt(t);
	while (t <= nom.length) {
		name += c;
		t++;
		c = nom.charAt(t);
	}
	name = name.replace(/_/g, " ");
	//name = name.replace(/"BASE LAYER"/g, "Fondos de Mapa");
	return name;
}

/**
 * Cambia el contenido de Bse Layer y Overlayers
 **/
function changeTitle() {	
	var cont = document.getElementById("content_legend");
	var tit = cont.getElementsByTagName("div");
	var row = tit[0].getElementsByTagName("div");		
	row[0].textContent = "Fondos de Mapa";
	row[2].textContent = "Capas";
}

function fullScreen(url) {
	url = url.replace(/#/g, '&');
	var options = ("toolbar=no, location=no, directories=no, status=no, menubar=no, witdh=100%, resizable=no, fullscreen=yes, scrollbars=auto");
	window.open(url+"&fs=1", "Visualizador - GeoBolivia", options);
}

function verifyFullScreen(panel) {
	var btnFs = null;	
	if (getUrlParameter('fs') != null) {
		// Maximizamos la pantalla
		window.moveTo(0, 0);
		if (document.all) {
			top.window.resizeTo(screen.availWidth, screen.availHeight);
		} else if (document.layers || document.getElementById) {
			if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
				top.window.outerHeight = screen.availHeight;
				top.window.outerWidth = screen.availWidth;
			}
		}
				
		// Creamos e insertamos botón de salir
		btnFs = new OpenLayers.Control.Button({
		displayClass : 'closeFs',
		title: 'SALIR',
		type : OpenLayers.Control.TYPE_TOGGLE,
		eventListeners : {
				'activate' : function() {				
					window.close();
				},
				'deactivate' : function() {
				}
			}
		});		
		
	}
	else{
		// Creamos e insertamos botón de fullScreen
		btnFs = new OpenLayers.Control.Button({
		displayClass : 'fs',
		title: 'Pantalla Completa',
		type : OpenLayers.Control.TYPE_TOGGLE,
		eventListeners : {
				'activate' : function() {								
					fullScreen(document.URL);
				},
				'deactivate' : function() {
				}
			}
		});	
	}
	panel.addControls([btnFs]);
}

// main
init = function() {
	var conf;
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0;
	// make OL compute scale according to WMS spec
	OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
	conf = new Configuration();		
	OpenLayers.ProxyHost = conf.proxy;
	conf.getUrlParameters();	
	setColorTitulo(hexToRgb(conf.newcolor),conf.tit_leyenda);	
	createMap(conf);
	changeTitle();	
};

window.onload = init;