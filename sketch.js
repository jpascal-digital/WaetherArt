// Jean-Pascal Martin
// http://jpascal.wordpress.com
// http://jpascal.martin.free.fr/p5/WeatherArt/

// Particle logic and library from
// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/BjoM9oKOAKY



// Global parameters
var online = true;
var globalSpeed = 2;
var globalWindFactor = 0.5;
var nbParticules = 500;  //800;
var refreshFrequency=600;
var minSpeed = 0.5;
var showValue = true;
var showDebugValue = false;
var showVectorMap = false;
var scl = 10;
var isLooping = true;
var deathprobabilityInitial = 0.0002;
var urlOWM_Weather = 'http://api.openweathermap.org/data/2.5/weather?q=Grenoble,FR&APPID=5aec572df5f6c3d00435e9666bf50a3a';
var autoFramerate = false;
var minFramerate = 10;
var maxFramerate = 25;
	
// Variables initialization
var bckStrength=15;
var divergence;
var inc = 0.1; //0.26;
var raining = false;
var cloudy = false;
var snowy = false;
var deathprobability= deathprobabilityInitial;

var pollutionScore = 1;
var cols, rows;
var zoff = 0;    
var zoffInc = 0.0003; //0.0003;
var fr;
var particles = [];
var turningForce=1; //1;
var flowfield;
var fluidity;
var weather;
var bckColor=123;

var currentColorInc = 1;
var colorMax = 225;
var colorMin = 125;
var currentColor = colorMin;

var refreshTime=refreshFrequency;
var refreshTimeCycle=1;

// valeur JSON de test

//touche 2
var testJSON_TempsCalmeFroidS_HPression_NoWind_sec = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"testJSON_TempsCalmeFroidS_HPression_NoWind_sec","description":"moderate rain","icon":"10d"}],"base":"stations","main":{"temp":273.15,"pressure":1050,"humidity":25,"temp_min":270.15,"temp_max":275.15},"visibility":10000,"wind":{"speed":2,"deg":180},"clouds":{"all":75},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

//touche 3
var testJSON_TempsCalmeChaudW_BPression_LittleWind = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"testJSON_TempsCalmeChaudW_BPression_LittleWind","description":"moderate rain","icon":"10d"}],"base":"stations","main":{"temp":303.15,"pressure":950,"humidity":0,"temp_min":300.15,"temp_max":310.15},"visibility":10000,"wind":{"speed":4.1,"deg":90},"clouds":{"all":50},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

//touche 4
var testJSON_TempeteFroidE_sec = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"testJSON_TempeteFroidE_sec","description":"moderate rain","icon":"10d"}],"base":"stations","main":{"temp":270.15,"pressure":1100,"humidity":0,"temp_min":265.15,"temp_max":280.15},"visibility":10000,"wind":{"speed":15.1,"deg":270},"clouds":{"all":25},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

// touche 5
var testJSON_TempeteChaudSE = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"testJSON_TempeteChaudSE","description":"moderate rain","icon":"10d"}],"base":"stations","main":{"temp":300.15,"pressure":1050,"humidity":100,"temp_min":299.15,"temp_max":310.15},"visibility":10000,"wind":{"speed":20.1,"deg":225},"clouds":{"all":0},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

// touche 1
var testJSON_MinEnergy = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"MinEnergy","description":"Waiting for real data","icon":"10d"}],"base":"stations","main":{"temp":310.15,"pressure":1200,"humidity":0,"temp_min":280.15,"temp_max":280.15},"visibility":10000,"wind":{"speed":0,"deg":0},"clouds":{"all":10},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

//touche 6
var testJSON_MaxEnergy = {"coord":{"lon":2.35,"lat":48.85},"weather":[{"id":501,"main":"MaxEnergy","description":"moderate rain","icon":"10d"}],"base":"stations","main":{"temp":250.15,"pressure":900,"humidity":50,"temp_min":270.15,"temp_max":310.15},"visibility":10000,"wind":{"speed":20,"deg":0},"clouds":{"all":100},"dt":1488283200,"sys":{"type":1,"id":5615,"message":0.0412,"country":"FR","sunrise":1488263599,"sunset":1488303206},"id":2988507,"name":"Paris","cod":200}

var humidity;
var temp;
var pressure;
var windDirection;
var windSpeed;
var locationData;
var timeLastRefresh;
var clouds;

var docPage;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  cols = floor(width / scl)+1;
  rows = floor(height / scl)+1;
  
  //docPage = createA('http://jpascal.martin.free.fr/p5/WeatherArt/doc.html','read the doc','_blank');
  
  if (online) {
	weather = testJSON_TempsCalmeChaudW_BPression_LittleWind;
	
	loadJSON(urlOWM_Weather, gotWeather);
  }
  else
  {
	weather = testJSON_MinEnergy;
  }

  flowfield = new Array(cols * rows);
  
  readData();
  
  for (var i = 0; i < nbParticules; i++) {
    particles[i] = new Particle(getParticleType());
  }
  background(255);

}


function readData() {
  // initialize weather var
  humidity = weather.main.humidity;  // 0% - 100%
  //bckStrength = 255-humidity*2.55;
  temp = floor(weather.main.temp - 273.15);				//  -4 - 100
  pressure = weather.main.pressure;		// 900 - 1100 ?
  windDirection = weather.wind.deg;		// 0 - 360
  windSpeed = weather.wind.speed;  		// ce sont des m/s
  clouds = weather.clouds.all;
  locationData = weather.name;
  timeLastRefresh = hour()+":"+minute();
  zoff = random(1);						// valeur arbitraire
  fluidity = (1200-pressure)/80*globalSpeed;   // la vitesse des particules sans tenir compte du vent.
  turningForce = (1200-pressure)/1000*globalSpeed/3; 			  // rayon des turbulences
  zoffInc= (1200-pressure)/4000000;              // le déplacement des masses dépend de la pression atmosphérique 
  //print(zoffInc);
  //pollutionScore = pollution.data[0].value * 5;
  divergence = fluidity/7;					//0 - 100
  var colorMed = 255-map(temp, -15,45,0,255);
  colorMin = floor(max(colorMed-40,0));
  colorMax = floor(min(colorMed+40,255));
  if (currentColor<colorMax) {currentColorInc = 1;}
  if (currentColor>colorMax) {currentColorInc = -1;}
  //print (colorMin + ' / '+colorMed+ ' / '+colorMax);
  deathprobability = deathprobabilityInitial * humidity/50 + deathprobabilityInitial;
  setMeteo(windDirection, windSpeed, globalWindFactor);
}

function gotWeather(data) {
	weather = data;
	readData();
	print("Got a weather !");
	onlineWeather = weather;
}

function draw() {
  //background(255,255,0,humidity/2);
  if (weather.visibility< 10000) { 
	//background(0,pollutionScore*15,0,humidity/20);
	
  }
  //background(clouds*3,clouds,clouds,humidity);
  if (showVectorMap) {
	background(0,0,0,10);
  }
  
  bckColor = (bckColor+1)%256;
  refreshTime = floor(millis()/1000)*-1 + refreshFrequency * refreshTimeCycle;  
  if (refreshTime<0) {
	refreshTimeCycle++;
	loadJSON(urlOWM_Weather, gotWeather);
	refreshTime= refreshFrequency;
  }
    
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(globalSpeed);
      flowfield[index] = v;
      xoff += inc;
      if (showVectorMap) {
		  stroke(255,60);
		  push();
		  translate(x * scl, y * scl);
		  rotate(v.heading());
		  strokeWeight(1);
		  line(0, 0, scl, 0);
		  pop();
	  }
    }
    yoff += inc;
    zoff += zoffInc; 
  }

  
  for (var i = 0; i < nbParticules; i++) {
    if (random(1)<deathprobability) {
	  particles[i] = new Particle(getParticleType());
    }
	particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show(1);
  }
  
  if (showValue) {
	  stroke(180,100,100);
	  fill(000,0,200);
	  text("Location: "+locationData+", "+weather.sys.country+ " - time: "+timeLastRefresh, 10, 35);
	  text("Weather: "+weather.weather[0].main+" - "+weather.weather[0].description, 10, 55);
	  text("humidity: "+humidity+"% - temp: "+temp+char(176)+"C - pressure: "+pressure+" hpa",10,75);
	  text("wind direction: "+windDirection+" - speed: "+windSpeed*3.6+" km/h - Cloud: "+weather.clouds.all+"%",10,95);
	  text("Visibility: "+weather.visibility,10,115);
 }
  if (showDebugValue) {
	  stroke(180,100,100);
	  fill(000,0,200);
	  
	  text("refresh: "+refreshTime + " - currentColor: "+currentColor+ " - nb particules: "+nbParticules,10, windowHeight - 15);
	  text(floor(frameRate())+" fps - inc: "+inc+" - zoffInc: "+zoffInc +" -scl: "+scl+" bckStrength: "+bckStrength + " - fluidity: "+fluidity+" - divergence: "+divergence+" - turningForce: "+turningForce,10,windowHeight-35);
  }
  currentColor = currentColor + currentColorInc;
  if (currentColor == colorMax) { currentColorInc = -1; }
  if (currentColor == colorMin) { currentColorInc = 1; }
  
  if (autoFramerate) { checkFramerate(); }
}

function checkFramerate() {
  if (frameRate()<minFramerate) {
	if (nbParticules>10) { nbParticules -=2;}
	//print("Too many particles");
  } 

  if (frameRate()>maxFramerate) {
    for (var i = nbParticules; i < nbParticules + 2; i++) {
		particles[i] = new Particle(getParticleType());
	}
	nbParticules +=2;
	//print("Not enough particles");
  }	
 
}

function getParticleType() {
  var hasard = random(100);
  var r;
  if (hasard>humidity) { r = 1;}
  else { r =2; }
  // print ("type = "+r);
  return r;
}

function keyPressed() {
  print(keyCode + " - " + key);
  
  if (key==' ') {showValue=!showValue;}
  if (key=='²') {weather = onlineWeather; online = true; readData();}
  
  if (key=='1') {weather = testJSON_MinEnergy; readData();}
  if (key=='2') {weather = testJSON_TempsCalmeFroidS_HPression_NoWind_sec; readData();}
  if (key=='3') {weather = testJSON_TempsCalmeChaudW_BPression_LittleWind; readData();}
  if (key=='4') {weather = testJSON_TempeteFroidE_sec; readData();}
  if (key=='5') {weather = testJSON_TempeteChaudSE; readData();}
  if (key=='6') {weather = testJSON_MaxEnergy; readData();}
	
 if (key=='7') {pollutionScore =0; }
 if (key=='8') {pollutionScore = 1;}
 if (key=='9') {pollutionScore  = 2;}
 if (key=='0') {pollutionScore = 3;} 
 
 if (key=='B') { background(0); }
 if (key=='W') { background(255); }
 if (key=='C') { currentColor = colorMin; currentColorInc = 1; }
 if (key=='D') { showDebugValue = !showDebugValue; }
 if (key=='V') { showVectorMap = !showVectorMap; }
 if (key=='H') { httpDo('http://jpascal.martin.free.fr/p5/WeatherArt/doc.html'); print("opening the doc");}
 if (key=='X') { colorMode(RVB, 255);  background(0,0,0,0); }
 
 
  if (key=="A") { autoFramerate = !autoFramerate;}
 
  if (keyCode == ENTER) { 
	if (isLooping) { noLoop(); }
	else {loop();}
	isLooping = !isLooping;
  }
  
  if (keyCode === LEFT_ARROW) {
    turningForce *=1.1;
  } 
  if (keyCode === UP_ARROW) {
    for (var i = nbParticules; i < nbParticules + 10; i++) {
		particles[i] = new Particle(getParticleType());
	}
	nbParticules +=10;
  } 
  
   if (keyCode === DOWN_ARROW) {
	nbParticules -=10;
  } 
  

 if (keyCode === RIGHT_ARROW) {
    turningForce /=1.1;
  }
  if (key == 'm') {
    bckStrength += 5;
	if (bckStrength > 255) { bckStrength=255; }
  }
  if (key == 'k') {
    bckStrength -= 5;
	if (bckStrength < 0) { bckStrength=0; }
  }
  //print(floor(frameRate())+" - inc: "+inc+" - zoff: "+zoffInc +" -scl: "+scl+" bckStrength: "+bckStrength + " turningForce: "+turningForce);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	scl = windowHeight/10;
	cols = floor(windowWidth / scl)+1;
	rows = floor(windowHeight / scl)+1;
	background(255);
}
