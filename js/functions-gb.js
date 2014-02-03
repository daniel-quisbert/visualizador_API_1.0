
function hiddenToolsLegend() {
	var t = document.getElementById('tools');
	var l = document.getElementById('cbp-spmenu-s2');
	t.style.display = 'none';
	l.style.display = 'none';
}

function showToolsLegend() {
	var t = document.getElementById('tools');
	var l = document.getElementById('cbp-spmenu-s2');
	t.style.display = 'block';
	l.style.display = 'block';
}

function generateQr() {
	var permaqr = OpenLayers.Util.getElement("permaQR");
	permaqr.src = "http://chart.apis.google.com/chart?cht=qr&chs=180x180&chl=" + encodeURIComponent(document.URL + "&fs=1");
}
function socialShare(s){
	var socialUrl= [
        'Twitter' => 'https://twitter.com/intent/tweet?text=',
        'Google+' => 'https://plus.google.com/share?url=',
        'Facebook'=> 'http://www.facebook.com/sharer/sharer.php?u='
    ];
	var options = ("toolbar=no, location=no, directories=no, status=no, menubar=no, witdh=100%, resizable=no, fullscreen=yes, scrollbars=auto");
	window.open(socialUrl[s]+encodeURIComponent(document.URL + "&fs=1"), "GeoBolivia", options);
}
