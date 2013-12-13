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
 * Modify by:
 * @author mquisbert@geo.gob.bo [Daniel Quisbert]
 */

/**
 * @requires OpenLayers/Map.js
 */

/*jslint browser: true*/
/*global OpenLayers*/

/*(function () {*/
"use strict";

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
	//this.proxy = "/proxy/?url=";
	this.proxy = "/cgi-bin/proxy.cgi?url=";
	//this.hasLegend = false;
	//this.legendWidthWithin = '199px';
	//this.legendWidth = '200px';
	//this.hasMetadata = false;
	//this.metadataHeightWithin = '190px';
	//this.metadataHeight = '200px';
	/*this.hasTools = false;
	this.toolsHeightWithin = '28px';
	this.toolsBorder = '1px';
	this.toolsHeight = '29px';
	this.hasMeasureTools = false;*/	
	this.zdakar = '0';	// zdakar: variable sólo para los mapas del DAKAR
}

/**
 * Parse and validate the URL parameters
 */
Configuration.prototype.getUrlParameters = function() {
	
	this.infoLayer = (getUrlParameter('infoLayer') === "on") || this.infoLayer;
	this.bgmap = getUrlParameter('bgmap') || this.bgmap;
	this.bgmap2 = getUrlParameter('bgmap2') || this.bgmap2;
	this.wmcUrl = getUrlParameter('wmc') || this.wmcURL;
	this.wmcUrl = this.wmcUrl.replace(/www.geo.gob.bo/g, 'geo.gob.bo');
	//this.hasLegend = (getUrlParameter('legend') === "on") || this.hasLegend;
	//this.legendWidth = createSizePx(getUrlParameter('legendwidth')) || this.legendWidth;
	//this.legendWidthWithin = createSizePx(this.legendWidth, -1);
	//this.hasMetadata = (getUrlParameter('metadata') === "on") || this.hasMetadata;
	//this.metadataHeight = createSizePx(getUrlParameter('metadataheight')) || this.metadataHeight;
	//this.metadataHeightWithin = createSizePx(this.metadataHeight, -10);
	this.hasTools = (getUrlParameter('tools') === "on") || this.hasTools;		
	this.zdakar = getUrlParameter('zdakar') || this.zdakar;
	//this.hasMeasureTools = (getUrlParameter('measuretools') === "on") || this.hasMeasureTools;
};

/**
 * Set the size of all <div> elements
 * @param {Configuration} conf Configuration of the viewer
 */
function createLayout(conf) {
	var wrapper1, wrapper2, wrapper3, wrapper4, map, legend, metadata, tools, icons, measure;

	/*wrapper1 = document.getElementById('wrapper1');
	wrapper2 = document.getElementById('wrapper2');
	wrapper3 = document.getElementById('wrapper3');
	wrapper4 = document.getElementById('wrapper4');*/
	map = document.getElementById('map');
	//legend = document.getElementById('legend');
	legend = document.getElementById('cbp-spmenu-s2');
	
	//metadata = document.getElementById('metadata');
	tools = document.getElementById('tools');
	icons = document.getElementById('icons');
	measure = document.getElementById('measure');

	/*if (conf.hasTools) {
		wrapper4.style.top = conf.toolsHeight;
		tools.style.height = conf.toolsHeightWithin;
		tools.style.borderBottomWidth = conf.toolsBorder;
		//if (!conf.hasMeasureTools) {
			//tools.removeChild(measure);
		//}
	} else {
		wrapper3.removeChild(tools);
	}

	/*if (conf.hasMetadata) {
		wrapper2.style.bottom = conf.metadataHeight;
		metadata.style.height = conf.metadataHeightWithin;
		metadata.style.display = 'block';
	} 
	/*else {
		wrapper1.removeChild(metadata);
	}*/

	/*if (conf.hasLegend) {
		wrapper3.style.marginLeft = '-' + conf.legendWidth;
		tools.style.marginLeft = '-' + conf.legendWidth;
		icons.style.marginLeft = conf.legendWidth;
		wrapper4.style.marginLeft = '-' + conf.legendWidth;
		map.setAttribute('style', 'margin-left: ' + conf.legendWidth + ' !important');
		legend.style.width = conf.legendWidthWithin;
	} 
	/*	else {
		wrapper2.removeChild(legend);
	}*/
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
	var control, i, layer;	
	//if (map && document.getElementById('legend')) {
	if (map && document.getElementById('cbp-spmenu-s2')) {
		for ( i = 0; i < map.layers.length; i += 1) {
			layer = map.layers[i];
			if (layer.getVisibility() && layer.params) {
				var url = layer.url + "request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=" + layer.params["LAYERS"];
				layer.name =  "<img src='" + url + "'/> <em style='color:#fff;'>"+layer.name+"</em>";
			}
		}
		control = new OpenLayers.Control.LayerSwitcher({
			'div' : OpenLayers.Util.getElement('cbp-spmenu-s2')
		});
		map.addControl(control);
	}
}

function createLegend(conf) {
	var control, i, layer;

	if (map && conf.hasLegend && document.getElementById('legend')) {
		/* Include the legend images in the layers name */
		for ( i = 0; i < map.layers.length; i += 1) {
			layer = map.layers[i];
			if (layer.metadata && layer.metadata.styles[0] && layer.metadata.styles[0].legend && layer.metadata.styles[0].legend.href) {
				layer.name = layer.name + '<br/><img src="' + layer.metadata.styles[0].legend.href + '"/>';
			}
		}

		control = new OpenLayers.Control.LayerSwitcher({
			'div' : OpenLayers.Util.getElement('legend')
		});
		map.addControl(control);
	}
}

/**
 * Add an item in the <ul> list of the #metadata <div>
 * @param {Array} capLayer Layer array extracted from GetCapabilities response
 */
function addMetadataItem(capLayer) {
	var metadataUl, item, li, attr;
	metadataUl = document.getElementById('metadata-ul');
	if (capLayer && metadataUl) {
		item = '';
		if (capLayer.title) {
			item += "<span class='title'>" + capLayer.title + "</span>";
		}
		if (capLayer.metadataURLs.length > 0) {
			if (capLayer.metadataURLs[0].href) {
				item += "<span class='metadata-url'><a href='" + capLayer.metadataURLs[0].href + "'>Más información</a></span>";
			}
		}
		if (capLayer.attribution) {
			attr = '';
			if (capLayer.attribution.title) {
				attr += capLayer.attribution.title;
			}
			if (capLayer.attribution.logo && capLayer.attribution.logo.href) {
				attr += "<img src='" + capLayer.attribution.logo.href + "'/>";
			}
			if (capLayer.attribution.href) {
				attr = "<a href='" + capLayer.attribution.href + "'>" + attr + "</a>";
			}
			item += "<span class='attribution'>" + attr + "</span>";
		}
		li = document.createElement('li');
		li.innerHTML = item;
		metadataUl.appendChild(li);
	}
}

/**
 * Get metadata of the layers using GetCapabilities
 * Put the results as properties of the layers
 */
function callbackGetCapabilities(request) {
	var xmlFormat, responseXml, capFormat, capObj, capLayers, i, j, capLayer, layer, attr;
	xmlFormat = new OpenLayers.Format.XML();
	capFormat = new OpenLayers.Format.WMSCapabilities();
	if (request.status < 200 || request.status >= 300) {
		// Error
		/*alert("Error de status " + request.status);*/
		return;
	}
	if (!request.responseText) {
		// Error
		/*alert("Error de responseText");*/
		return;
	}
	/*if (!request.responseXml) {
	 } else {
	 responseXml = request.responseXml;
	 }*/
	responseXml = xmlFormat.read(request.responseText);
	capObj = capFormat.read(responseXml);
	capLayers = capObj.capability.layers;
	if (map && map.layers.length > 0) {
		for ( j = 0; j < map.layers.length; j += 1) {
			for ( i = 0; i < capLayers.length; i += 1) {
				capLayer = capLayers[i];
				layer = map.layers[j];
				if (layer.params.LAYERS === capLayer.name) {
					/* Match */
					addMetadataItem(capLayer);
				}
			}
		}
	}
}

/**
 * Get metadata of the layers using GetCapabilities
 * Put the results as properties of the layers
 */
function getRemoteMetadata() {
	var i, layer, wmsUrls, urlOrig, version, urlObj, url;
	if (map && map.layers.length > 0) {
		wmsUrls = [];

		/* Prepare the WMS URL (various layers may share the same WMS URL) */
		for ( i = 0; i < map.layers.length; i += 1) {
			layer = map.layers[i];

			/* Refactor the URL to avoid :80/ */
			urlOrig = layer.url;
			version = layer.params.VERSION;
			if (urlOrig && version) {
				urlObj = OpenLayers.Util.createUrlObject(urlOrig);
				url = urlObj.protocol + '//' + urlObj.host;
				if (urlObj.port && urlObj.port !== "80") {
					url += ':' + urlObj.port;
				}
				url += urlObj.pathname;
				urlObj.args.REQUEST = "GetCapabilities";
				urlObj.args.VERSION = version;
				url = OpenLayers.Util.urlAppend(url, OpenLayers.Util.getParameterString(urlObj.args));
				if (wmsUrls.indexOf(url) < 0) {
					wmsUrls.push(url);
				}
			}
		}

		for ( i = 0; i < wmsUrls.length; i += 1) {
			OpenLayers.Request.GET({
				url : wmsUrls[i],
				callback : callbackGetCapabilities,
				async : false
			});
		}

	}
}

/**
 * Fill the #metadata <div>
 */
function createMetadata(conf) {
	var metadata, list, content, i, layer, nameStr, metadataStr;

	metadata = document.getElementById('metadata');
	if (map && conf.hasMetadata && metadata) {
		if (map.layers.length > 0) {
			getRemoteMetadata();
		}
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
		out += "longitud: " + event.measure.toPrecision(4) + " " + event.units;
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
		out += "superficie: " + Number(event.measure.toPrecision(4)) + " " + event.units + "<sup>2</" + "sup>";
	}
	element.innerHTML = out;
}

/**
 * Fill the #tools <div>
 */
function createTools(conf) {
	var tools, icons, measure, panelCtl, fakePanCtl, navCtl, lineMeasureCtl, areaMeasureCtl;

	tools = document.getElementById('tools');
	icons = document.getElementById('icons');
	measure = document.getElementById('measure');
	if (map && conf.hasTools && tools && icons) {
		/* Controls */
		navCtl = new OpenLayers.Control.NavigationHistory({
			'displayClass' : 'hist'
		});
		fakePanCtl = new OpenLayers.Control({
			displayClass : 'pan'
		});
		/* Controls panel */
		panelCtl = new OpenLayers.Control.Panel({
			'div' : icons,
			'defaultControl' : fakePanCtl
		});
		/* Add to map */
		map.addControl(navCtl);
		panelCtl.addControls([navCtl.previous, navCtl.next, fakePanCtl]);
		//if (conf.hasMeasureTools && measure) {
			lineMeasureCtl = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
				persist : true,
				immediate : true,
				displayClass : 'path'
			});
			lineMeasureCtl.events.on({
				"measure" : handleLineMeasure,
				"measurepartial" : handleLineMeasure
			});
			areaMeasureCtl = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
				persist : true,
				immediate : true,
				displayClass : 'polygon'
			});
			areaMeasureCtl.events.on({
				"measure" : handleAreaMeasure,
				"measurepartial" : handleAreaMeasure
			});
			panelCtl.addControls([lineMeasureCtl, areaMeasureCtl]);
		//}
		map.addControl(panelCtl);
	}
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
			OpenLayers.DOTS_PER_INCH = 90.71428571428572;
			var text = request.responseText;
			context = format.read(text);

			// Change the map scale
			MAP_SCALES = [
			4265.459166936, 8530.918333871, 
			17061.836667742, 34123.673335484, 
			68247.346670968, 136494.693341936, 
			272989.386683873, 545978.773367746, 
			1091957.546735491, 2183915.093470982, 
			4367830.186941965, 8735660.373883929];
			options = {
				scales : MAP_SCALES
			};					
				map = new OpenLayers.Map("map", {					
			       	div : 'map',
			       	//allOverlays : true,
			        maxResolution: 196543.0339,			       	
			       	//restrictedExtent : extendOsmGoogle(context.bounds),
			       	units: context.units,		       	
			       	maxExtent: extendOsmGoogle(context.bounds),
			        numZoomLevels : 22,
					projection : new OpenLayers.Projection("EPSG:900913"),
					displayProjection : new OpenLayers.Projection("EPSG:4326")					        	
				});
				map.setOptions(options);				
				if(backgroundMap(conf) != 0){
					map.addLayers(backgroundMap(conf));
				}
				if(backgroundMap2(conf) != 0){
					map.addLayers(backgroundMap2(conf));
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
			
			z = 6;	// z: nivel de ZOOM para los mapas	
			b =  context.bounds;
			if(conf.zdakar != "0"){
				z = 16;				
				b = boundZdakar(conf.zdakar);
			}
			map.setCenter(
				b.getCenterLonLat(), 
				z
			);
			// fondo de mapa con zoom de acuerdo a los boundingbox
			//map.zoomToExtent(extendOsmGoogle(context.bounds));			
		}
	});
	return request;
}
/**
 * Ajuste de los Bounds a los de las regiones del DAKAR, (Potosí, Tupiza, Uyuni, Villazón)
 */
 
function boundZdakar(zd){
	var b;
	switch (zd) {
		case "1":
		// Bounds Potosi
		b =  new OpenLayers.Bounds(-7320602.74929959979, -2224697.49292859994, -7318792.54567920044, -2223829.49119260022);
		break;		
		case "2":
		// Bounds Tupiza
		b =  new OpenLayers.Bounds(-7316226.49234179966, -2445124.33855020022, -7315502.41089360043, -2444777.13785579987);
		break;		
		case "3":
		// Bounds Uyuni
		b =  new OpenLayers.Bounds(-7439091.37992199976, -2328056.60538739990, -7438367.29847379960, -2327709.40469300002);
		break;		
		case "4":
		// Bounds Villazón
		b =  new OpenLayers.Bounds(-7302493.48005960044, -2522538.37589279981, -7301769.39861140028, -2522191.17519839993);
		break;
	}
	return b;
}
/**
 * Verifica si los bounds son los de la región
 * */
function searchBounds(bounds){
	var resp = false, c=0;	
	var s= [-7320602.74929959979, -2224697.49292859994, -7318792.54567920044, -2223829.49119260022,	
			-7316226.49234179966, -2445124.33855020022, -7315502.41089360043, -2444777.13785579987,	
			-7439091.37992199976, -2328056.60538739990, -7438367.29847379960, -2327709.40469300002,	
			-7302493.48005960044, -2522538.37589279981, -7301769.39861140028, -2522191.17519839993];		
	for(var j=0; j<4 ; j++){		
		for(var i=0; i<s.length;i++){
			if(bounds[j]==parseFloat(s[i]).toFixed(7)){
				c++;
			}
		}			
	}	
	if(c > 2){
		resp =  true;			
	}	
	return resp;
}

function extendOsmGoogle (extendMap){
	var nx, a;
	a = extendMap.toArray();				
	a[0] = parseFloat(a[0]) + parseFloat(a[0])*-0.011;	
	a[1] = parseFloat(a[1]) + parseFloat(a[1])*	0.0;	
	a[2] = parseFloat(a[2]) + parseFloat(a[2])*	0.0;	
	a[3] = parseFloat(a[3]) + parseFloat(a[3])*	0.0;		
	nx = new OpenLayers.Bounds(a[0],a[1],a[2],a[3]);			
	return nx;
}	

function backgroundMap(conf) {
	var bmap;
	switch (conf.bgmap) {
		case "fondo_osm_mapnik":
			bmap = new OpenLayers.Layer.OSM("Mapnik");
			break;		
		case "fondo_osm_google_like":   
		  	bmap = new OpenLayers.Layer.OSM("Google-like",  
		  		 ["http://a.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png", "http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png", "http://c.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/9/256/${z}/${x}/${y}.png"], {  
		 		"tileOptions" : {  
		 		"crossOriginKeyword" : null  
		 		}  
		 	}); 			  
		break;  
		case "fondo_osm_midnight_commander":
			bmap = new OpenLayers.Layer.OSM("Midnight Commander", 
				["http://a.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png", "http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png", "http://c.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png"], {				
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
					
		case "fondo_opcional":			
			bmap = 0;
			break;
		default:
			break;		
	}
	return [bmap];
}

function backgroundMap2(conf) {
	var bmap2;
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
		case "fondo_opcional":			
			bmap2 = 0;
			break;
		default:
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

function infoPopup(){
    var info, panel, popup;
    var panelPopup = new OpenLayers.Control.Panel({displayClass: 'first'});    
    map.addControl(panelPopup);
        	
	 // create a control to get feature info from queryable layers
            info = new OpenLayers.Control.WMSGetFeatureInfo({
                //url: "http://localhost:8080/geoserver/wms",
                title: 'Identify features by clicking',
                //layers: yyyyy,
            });
            map.addControl(info);

            // register a listener for the getfeatureinfo event on the control
            info.events.on({
                getfeatureinfo: function(event) {
                    // close existing popup
                    if (popup) {
                        popup.destroy();
                    }
                     var text = "<html><body>No existen datos para ser consultados</body></html>";
					if(event.text.indexOf("/table") > 0){
						text = event.text;
					} 
                    popup = new GeoExt.Popup({
                        title: "GeoBolivia",
                        //location: event.xy,
                        map: map,
                        location: new OpenLayers.Geometry.Point(
                        	map.getLonLatFromPixel(event.xy).lon,
                        	map.getLonLatFromPixel(event.xy).lat),
                        lonlat: map.getLonLatFromPixel(event.xy),
                        width: 200,
                        height: 200,
                        autoScroll: true,
                        collapsible: true,
                        bodyStyle: {padding: 5},                        
                        html: text
                    });                    
                    popup.show();
                }
            });    
        
    var btnPopup = new OpenLayers.Control.Button({
    	displayClass: 'first', 
    	type: OpenLayers.Control.TYPE_TOGGLE, 
    	eventListeners: {
    		'activate': function(){info.activate()}, 
    		'deactivate': function(){
			    	popup.destroy();
			    	info.deactivate();
    			}
    	}});
    panelPopup.addControls([btnPopup]);
}


function infoPopup2() {
	var info1, panel, popup;
	var panelPopup = new OpenLayers.Control.Panel({
		displayClass : 'first'
	});
	map.addControl(panelPopup);
		info1 = new OpenLayers.Control.WMSGetFeatureInfo({
			infoFormat : 'application/vnd.ogc.gml',
			title : 'Información',
			queryVisible : true	
		});
		map.addControl(info1);
		// register a listener for the getfeatureinfo event on the control
		info1.events.on({
			getfeatureinfo : function(info) {
                var features = info.features;
                var layersStr = "<ul id='tapi'>";
                var model = [];
                var attributes = {};
                var nomLayer = "";
				layersStr += "<li style='font-size:10px;'><a href='#'> No existen datos para consultar </a></li>";
				if (features.length > 0) {
				for (var i=0; i<features.length ;i++) {
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
				row="";
                for (i = 0; i < model.length; i++) {
                    row += "<li><a href='#'>"+cleanNameLayer(model[i][0])+"</a><ul>";
                    //var row2 = model[i+1];
					for (var j = 1; j < model[i].length; j=j+2) {
						var cod = model[i][j].slice(0,3);	
					if((cod != "cod") && (cod != "COD") && model[i][j+1] != null){	
							//if(cod != "cod" && cod != "COD"){
                        		row += "<li><a href='#'><b style='min-width:70px;text-transform:capitalize;'>";
                        		row += model[i][j];
                        		row += ": </b>";
                        		row += model[i][j+1];
                        		row += "</a></li>";
							//}
						}
                    }
                    row += "</ul></li>";
                }				
				
				layersStr += row+"</ul>";				
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
		});		//		featureInfo();
	//}
	
	var btnPopup = new OpenLayers.Control.Button({
		displayClass : 'first',
		type : OpenLayers.Control.TYPE_TOGGLE,
		eventListeners : {
			'activate' : function() {
				info1.activate()
			},
			'deactivate' : function() {
				for (var i=0; i<map.popups.length; i++) {
				    map.removePopup(map.popups[i]);
				  popup.destroy();
				 }
				//popup.destroy();
				info1.deactivate();
			}
		}
	});
	panelPopup.addControls([btnPopup]);
}


function cleanNameLayer(nom){
	var t=0;
	var name="";
	var c = nom.charAt(t);	
	while(c != "." && t <= nom.length){
		name += c;
		t++;
		c = nom.charAt(t);	
	}
	name = name.replace(/_/g," ");
	return name;
}
// main
init = function() {
	var conf;
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0;
    // make OL compute scale according to WMS spec
    //OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
	conf = new Configuration();
	OpenLayers.ProxyHost = conf.proxy;
	conf.getUrlParameters();
	createLayout(conf);
	createMap(conf);
	if(conf.infoLayer){
		infoPopup2();	
	}
	
	//menu de capas
	//map.addControl(new OpenLayers.Control.LayerSwitcher({'baseLblTitle':"Capas Base",'dataLblTitle':"Datos"}));
};

window.onload = init;

/*}());*/