/**
 * Dynamically create the Financial aids for each item in the toolbar.
 * 
 * Also features to help in displaying toolbars
 * 
 * @author: Daniel Quisbert [mquisbert@geo.gob.bo]
 */

function createHelpInformation() {
	var tool_nav = (getUrlParameter('tools_nav') === "on");
	var tool = (getUrlParameter('tools') === "on");
	var infoLayer = (getUrlParameter('infoLayer') === "on");

	var btnApi = {
		home : {
			ico : "icon-world-on.png",
			title : "Botón Vista Inicial",
			desc : "Posiciona el mapa a la vista inicial u original."
		},
		back : {
			ico : "icon-previous-on.png",
			title : "Botón Anterior",
			desc : "Posiciona el mapa a una vista o emplazamiento anterior."
		},
		next : {
			ico : "icon-next-on.png",
			title : "Botón Siguiente",
			desc : "Posiciona el mapa a una vista o emplazamiento posterior."
		},
		move : {
			ico : "icon-move-on.png",
			title : "Botón Mover",
			desc : "Indica que puede mover el mapa en cualquier dirección con la ayuda del mouse."
		},
		zoomin : {
			ico : "icon-zoomin-on.png",
			title : "Botón Acercamiento",
			desc : "Realiza un acercamiento (zoomin) al interior del mapa. Alternativa: realice doble clik en la zona preferida, o también con la rueda del mouse."
		},
		zoomout : {
			ico : "icon-zoomout-on.png",
			title : "Botón Alejamiento",
			desc : "Realiza un alejamiento (zoomout) al mapa. Alternativa: con la ruefa del mouse."
		},
		distance : {
			ico : "icon-distance-on.png",
			title : "Botón Medir Distancias",
			desc : "Habilita poder medir distancias entre 2 o más puntos. Uso: realice un click para indicar los primeros puntos y doble click para el punto final a medir."
		},
		area : {
			ico : "icon-area-on.png",
			title : "Botón Medir Áreas",
			desc : "Habilita poder medir áreas entre 3 o más puntos. Uso: realice un click para indicar los primeros puntos y doble click para el punto final a medir."
		},
		info : {
			ico : "icon-info-on.png",
			title : "Botón Información",
			desc : "Habilita poder obtener la información dentro de un popup de un lugar específico de cada capa. Uso: realice un click en el lugar del cual se quiere saber su información."
		},
		fullscreen : {
			ico : "icon-fullscreen-on.png",
			title : "Botón Pantalla Completa",
			desc : "Abre una nueva ventana con el mapa en pantalla completa."
		}
	};
	var tableInfo = document.getElementById('tableInfo');

	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	tbody.appendChild(createField(btnApi.home.ico, btnApi.home.title, btnApi.home.desc));
	if (tool_nav) {
		tbody.appendChild(createField(btnApi.back.ico, btnApi.back.title, btnApi.back.desc));
		tbody.appendChild(createField(btnApi.next.ico, btnApi.next.title, btnApi.next.desc));
	}
	tbody.appendChild(createField(btnApi.move.ico, btnApi.move.title, btnApi.move.desc));
	tbody.appendChild(createField(btnApi.zoomin.ico, btnApi.zoomin.title, btnApi.zoomin.desc));
	tbody.appendChild(createField(btnApi.zoomout.ico, btnApi.zoomout.title, btnApi.zoomout.desc));
	if (tool) {
		tbody.appendChild(createField(btnApi.distance.ico, btnApi.distance.title, btnApi.distance.desc));
		tbody.appendChild(createField(btnApi.area.ico, btnApi.area.title, btnApi.area.desc));
	}
	if (infoLayer)
		tbody.appendChild(createField(btnApi.info.ico, btnApi.info.title, btnApi.info.desc));

	tbody.appendChild(createField(btnApi.fullscreen.ico, btnApi.fullscreen.title, btnApi.fullscreen.desc));

	table.appendChild(tbody);
	tableInfo.appendChild(table);
}

function createField(ico, tit, des) {
	var tr, td, td2, img, clase, src, tit2, descripcion;
	tr = document.createElement('tr');
	td = document.createElement('td');
	td2 = document.createElement('td');
	img = document.createElement('img');
	// Se crean los atributos CLASS y TITLE
	clase = document.createAttribute('class');
	src = document.createAttribute('src');
	tit2 = document.createAttribute('title');
	clase.nodeValue = "ico";
	src.nodeValue = "img/" + ico;
	tit2.nodeValue = tit;
	img.setAttributeNode(clase);
	img.setAttributeNode(src);
	img.setAttributeNode(tit2);
	td.appendChild(img);

	descripcion = document.createTextNode(des);
	td2.appendChild(descripcion);
	tr.appendChild(td);
	tr.appendChild(td2);

	return tr;
}

createHelpInformation(); 

var menuLeft = document.getElementById('cbp-spmenu-s1'), showLeft = document.getElementById('showLeft'), body = document.body;
showLeft.onclick = function() {
	classie.toggle(this, 'active');
	classie.toggle(menuLeft, 'cbp-spmenu-open');
};
var menuRight = document.getElementById('cbp-spmenu-s2'), showRight = document.getElementById('showRight'), body = document.body;
showRight.onclick = function() {
	classie.toggle(this, 'active');
	classie.toggle(menuRight, 'cbp-spmenu-open');
};
function hiddenToolsLegend() {

	var st = document.getElementById('secTools');
	var t = document.getElementById('tools');
	var l = document.getElementById('cbp-spmenu-s2');
	st.style.display = 'none';
	t.style.display = 'none';
	l.style.display = 'none';
}

function showToolsLegend() {
	var st = document.getElementById('secTools');
	var t = document.getElementById('tools');
	var l = document.getElementById('cbp-spmenu-s2');
	st.style.display = 'block';
	t.style.display = 'block';
	l.style.display = 'block';
}

function generateQr() {
	var permaqr = OpenLayers.Util.getElement("permaQR");
	permaqr.src = "http://chart.apis.google.com/chart?cht=qr&chs=150x150&chl=" + encodeURIComponent(document.URL + "&fs=1");
}

function socialShare(s) {
	var socialUrl = ['http://www.facebook.com/sharer/sharer.php?u=', 'https://twitter.com/intent/tweet?text=', 'https://plus.google.com/share?url='];
	var options = ("toolbar=no, location=no, directories=no, status=no, menubar=no, witdh=100%, resizable=no, fullscreen=yes, scrollbars=auto");
	window.open(socialUrl[s] + encodeURIComponent(document.URL.substring(0, document.URL.length - 3)) + "&fs=1", "GeoBolivia", options);
}

