// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/BjoM9oKOAKY

// upgraded by Jean-Pascal Martin
// http://jpascal.wordpress.com
// http://jpascal.martin.free.fr/p5/WeatherArt/

var wind;
var maxSpeed;
//var globalWindFactor;

var speed;

function setMeteo(deg, speed, aGlobalWindFactor) {
  //globalWindFactor = aGlobalWindFactor;
  wind = createVector(sin(deg/180*PI)*speed*globalWindFactor, cos(deg/180*PI)*speed*globalWindFactor);
  print("wind: "+wind);
  maxSpeed = fluidity+minSpeed;
}

function Particle(aKind) {
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);

  this.kindOf = aKind;
  
  this.prevPos = this.pos.copy();

  this.update = function() {
    this.vel.add(this.acc);
    this.vel.limit(maxSpeed);
    this.pos.add(this.vel);
	this.pos.add(wind);
	
	//var brownian = createVector(random()*divergence*4-divergence*2,random()*divergence*4-divergence*2);
	//print("brownian: "+brownian.x+','+brownian.y+' divergence: '+divergence);
	//this.pos.add(brownian);
    this.acc.mult(0.1);
  }
  
  this.follow = function(vectors) {
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  }

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.show = function() {
	var theGoodColor = (currentColor-20) % 255
	
	// s'il fait sec
	if (this.kindOf==1) {	
		//stroke(theGoodColor, 100, 100, 40);
		//strokeWeight(pollutionScore/40);
		//line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		stroke(theGoodColor, 255, 255, 180);
		strokeWeight(0.1);
		line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		this.updatePrev();
	}
	
	// si c'est humide
	if (this.kindOf==2) {	
		stroke(theGoodColor, 255, 255, 255);
		//strokeWeight((pollutionScore/4+3)*humidity/100+1);
		strokeWeight(0.2);
		//line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		var radius = humidity/50;
		fill(theGoodColor,255,255,100);
		ellipse(this.pos.x, this.pos.y,radius, radius);
		this.updatePrev();
		//this.kindOf=1;
	}
	
	// s'il pleut !
	if (this.kindOf==3) {	
		stroke(theGoodColor, 255, 255, 50);
		strokeWeight(0.5);
		//line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		var radius = humidity/30;
		fill(theGoodColor, 255, 255, 50);
		ellipse(this.pos.x, this.pos.y,radius, radius);
		this.updatePrev();
		this.kindOf=1;
	}
	
	// s'il neige !
	if (this.kindOf==4) {	
		stroke(theGoodColor, 255, 100);
		strokeWeight(0.5);
		//line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
		var radius = humidity/20;
		fill(255);
		ellipse(this.pos.x, this.pos.y,radius, radius);
		this.updatePrev();
		//this.kindOf=2;
	}
  }

  this.updatePrev = function() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  this.edges = function() {
    if (this.pos.x > width+10) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height+10) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }

}
