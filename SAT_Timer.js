// cross-browser event handling for IE5+, NS6+ and Mozilla/Gecko
//  by Scott Andrew
function addEvent( elm, evType, fn, useCapture )
{
	if ( elm.addEventListener )
	{
		elm.addEventListener( evType, fn, useCapture );
		return true;
	}
	else if ( elm.attachEvent )
	{
		var r = elm.attachEvent( 'on'+evType, fn );
		return r;
	}
	else
	{
		elm[ 'on'+evType ] = fn;
	}
}
function addDate()
{
	var t = new Date();
	var date = t.getMonth()+1 + "/" + t.getDate() + "/" + t.getFullYear();
	document.getElementById("date").innerText = date;
}
var sections = new Array( 's1', 'sb1', 's2', 's3', 'sb2', 's4', 'sb3', 's5');

function attachTimers()
{
	document.getElementById('systime').innerHTML = getTime(getNow(),false,true);
	window.setInterval( update, 200 );
	addEvent( document.getElementById('startButton'), 'click', start, false );
	// addEvent( document.getElementById('sectionComboBox'), 'change', updateSection, false );
	for ( var i=0; i<sections.length; i++ )
	{
		var tr = document.getElementById( sections[i] );
		var tds = tr.getElementsByTagName('td');
		for ( var j=SECTION; j<tds.length; j++ )
		{
			tds[j].style.fontStyle = 'italic';
			tds[j].style.color = '#999999';
		}
	}

	addEvent(document, 'keydown', handleKeypress, false);
}

function getTime(now,secs,ampm)
{
	var hh = now.getHours();
	var meridian = 'AM';
	if ( hh >= 12 ) {
		hh -= 12;
		meridian = 'PM';
	}
	if ( hh == 0 ) {
		hh = 12;
	}
	var mm = now.getMinutes();
	var ss = now.getSeconds();
	var time = '' + hh + ':' + zeroPad(mm);
	if ( secs )
		time += ':' + zeroPad(ss);
	else if ( ss % 2 == 0 )
		time = '' + hh + '<span>:</span>' + zeroPad(mm);
	if ( ampm )
		time += '<small>' + meridian + '</small>';
	return time;
}

function zeroPad(n)
{
	if ( n < 10 )
		return '0' + n;
	return n;
}

var sectionIndex = 0;
var min2 = 2 * 60 * 1000;
var min5 = 5 * 60 * 1000;
var min10 = 10 * 60 * 1000;
var min20 = 20 * 60 * 1000
var min25 = 25 * 60 * 1000;
var min30 = 30 * 60 * 1000;
var min35 = 35 * 60 * 1000;
var min45 = 45 * 60 * 1000;
var min50 = 50 * 60 * 1000;
var min55 = 55 * 60 * 1000;
var min60 = 60 * 60 * 1000;
var min65 = 65 * 60 * 1000;
var min1 = 1 * 60 * 1000;
var sec30 = 30 * 1000;
var sec25 = 25 * 1000;
var sec5 = 5 * 1000;
var endingtime = null;
var onbreak = false;
var fastforward = false;

var times = new Array( min65, min10, min35, min25, min5, min55, min2, min50 );
// var times = new Array( sec25, sec25, sec5, sec25, sec25, sec5, sec25, sec25, sec5, sec25, sec20, sec20, sec10 );
var gaps =  new Array( min1,   min1,   min1,   min1,  min1, min1, min1, min1,   min1,   min1,  min1, min1, min1 );

// enums
var SECTION  = 0;
var DURATION = 1;
var START    = 2;
var END      = 3;
var STATUS   = 4;

function updateSection()
{
	sectionIndex = document.getElementById('sectionComboBox').value;
}

var firstnow = 0;
function getNow()
{
	var t = new Date();
	if ( firstnow == 0 )
	{
		firstnow = t;
		return t;
	}
	if ( ! fastforward )
		return t;
	var diff = t.getTime() - firstnow.getTime();
	t.setTime( t.getTime() + diff*120 )
	return t;
}

function start()
{
	var now = getNow();
	var then = getNow();
	now.setTime( now.getTime() + 1000 );
	then.setTime( now.getTime() + times[sectionIndex] );

	var tds = document.getElementById( sections[sectionIndex] ).getElementsByTagName('td');
	for ( var j=0; j<tds.length; j++ )
	{
		tds[j].style.fontStyle = 'normal';
		tds[j].style.color = 'black';
	}
	tds[START].innerHTML = getTime(now,true,false);
	tds[END].innerHTML = getTime(then,true,false);
	tds[STATUS].innerHTML = 'in progress';
	endingtime = then;
	propogateNewTimes(then);

	// if we just started section 3, set stopping break time to 1 minute ago
	if ( sectionIndex == 3 ) {
		then = new Date( endingtime );
		then.setTime( now.getTime() - min1 );
		document.getElementById( 'sb' ).getElementsByTagName('td')[END].innerHTML = getTime(then,true,false);
	}
}

function propogateNewTimes(prevEnd)
{
	// walk through all rows after this one, fixing the times
	var t = getNow();
	for ( var i=sectionIndex+1; i<sections.length; i++ )
	{
		var tr = document.getElementById( sections[i] );
		var tds = tr.getElementsByTagName('td');
		t.setTime( prevEnd.getTime() + gaps[i] );
		tds[START].innerHTML = getTime(t,true,false);
		t.setTime( t.getTime() + times[i] );
		tds[END].innerHTML = getTime(t,true,false);
		prevEnd = t;
	}

}


function update()
{
	var now = getNow();
	document.getElementById('systime').innerHTML = getTime(now,false,true);
	fastforward = ( document.getElementById('fastforward').checked );
	if ( endingtime ) {
		document.getElementById('sectiontime').innerHTML = getTimeDiff(now.getTime(),endingtime.getTime());
	}
}

function getTimeDiff(now,then)
{
	var ms = then - now;
	if ( ms <= 1000 ) {
		endingtime = null;
		finishCurrentSection();
		advanceSection();
		return '0:00';
	}
	if ( ms <= 61000 )
		document.getElementById('sectiontime').className = 'soon';
	var ss = Math.floor(ms / 1000);
	var mm = Math.floor(ss / 60);
	ss = ss % 60;
	return ( '' + mm + ':' + zeroPad(ss) );
}

function finishCurrentSection()
{
	// clear red from timer
	document.getElementById('sectiontime').className = '';
	// change status from 'in progress' to 'done'
	document.getElementById( sections[sectionIndex] ).getElementsByTagName('td')[STATUS].innerHTML = 'done';
}

var theButtonText = 'not yet begun <input type="submit" id="startButton" value="Start Timer">';

function advanceSection()
{
	sectionIndex++;
	if ( sectionIndex == sections.length )
		return;

	var s = sections[sectionIndex];
	// break starts automatically; breaks are denoted with sb
	if ( s.indexOf("sb") >= 0 ) {
		onbreak = true;
		start();
	}
	else {
		document.getElementById( s ).getElementsByTagName('td')[STATUS].innerHTML = theButtonText;
		addEvent( document.getElementById('startButton'), 'click', start, false );
	}
}

function preventDefault(e)
{
	var evt = e ? e : window.event;
	if ( evt.preventDefault )
		evt.preventDefault();
	else
		evt.returnValue = false;

	return false;
}

var KEY_ENTER =  13;
var KEY_SPACE =  32;
var KEY_PG_DN =  34;
var KEY_B     =  66;
var KEY_F5    = 116;

function handleKeypress(e)
{
	var evt = e ? e : window.event;
	var ch = evt.keyCode;
	if ( ch === KEY_PG_DN || ch == KEY_B )
	{
		var startB = document.getElementById('startButton');
		if ( startB ) {
			startB.click();
			return preventDefault(evt);
		}
	}
	// This next bit is just because my stupid Kensingtom laser point sends "F5" when you press the laser.
	// Sorry for the inconvenience.
	if ( ch === KEY_F5 ) {
		evt.keyCode = 0; // <-- this is your fault, IE-8
		return preventDefault(evt);
	}
}

addEvent( window, 'load', attachTimers, false );
addEvent( window, 'load', addDate, false);