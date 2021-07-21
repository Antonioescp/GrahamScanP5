let points = [];
let extremePoints = [];

// buttons
// activates graham scan
let buttonGrahamScan;

// enables auto scan, it runs graham scan everytime you add a point
let buttonAutoScan;
let autoScan = false;

// resets points collections
let buttonReset;

// descriptive modes, on true it shows the graham scan process
let buttonMode;
let descriptiveMode = false;

function windowResized(){
    resizeCanvas(windowWidth - 100, windowHeight - 100);

    // updating buttons position
    buttonGrahamScan.position( 50, windowHeight - 35 );

    buttonAutoScan.position( buttonGrahamScan.position().x + buttonGrahamScan.size().width + 5, windowHeight - 35);

    buttonMode.position( buttonAutoScan.position().x + buttonAutoScan.size().width + 5, windowHeight - 35 );

    buttonReset.position(width + 5, windowHeight - 35);
}

function setup(){

    let mainCanvas = createCanvas(windowWidth - 100, windowHeight - 100);
    mainCanvas.parent('canvas-container');

    // button to execute graham scan
    buttonGrahamScan = createButton('Graham Scan');
    buttonGrahamScan.class('button-action');
    buttonGrahamScan.position( 50, windowHeight - 35);
    buttonGrahamScan.mouseClicked( () => {
        extremePoints = grahamScan();
    });

    // button to autoscan current points and auto update convexhull
    buttonAutoScan = createButton('Auto Scan = off');
    buttonAutoScan.class('button-inactive');
    buttonAutoScan.position( buttonGrahamScan.position().x + buttonGrahamScan.size().width + 5, windowHeight - 35);
    buttonAutoScan.mouseClicked( () => {
        autoScan = (autoScan) ? false : true;

        // resetting extreme points when turned off
        if(!autoScan)
            extremePoints = [];
        else{
            if(!descriptiveMode)
                extremePoints = grahamScan();
        }

        buttonAutoScan.class( (autoScan) ? 'button-active' : 'button-inactive' );

        buttonAutoScan.html(`Auto Scan = ${(autoScan ? 'on' : 'off')}`);
    });

    // button to change running mode
    buttonMode = createButton('Mode = normal');
    buttonMode.class('button-inactive');
    buttonMode.position( buttonAutoScan.position().x + buttonAutoScan.size().width + 5, windowHeight - 35 );
    buttonMode.mouseClicked( () => {
        descriptiveMode = (descriptiveMode) ? false : true;

        buttonMode.html(`Mode = ${(descriptiveMode) ? 'descriptive' : 'normal'}`);

        buttonMode.class(`${ descriptiveMode ? 'button-active' : 'button-inactive' }`);
    });

    // button to reset point collections
    buttonReset = createButton('Reset');
    buttonReset.class('button-action');
    buttonReset.position(width + 5, windowHeight - 35);
    buttonReset.mouseClicked(() => {
        points = [];
        extremePoints = [];
    });
}

function draw(){
    background(230);

    // shows grahamScan process
    if(descriptiveMode && points.length > 0){

        let s = [];
        let t = [];

        let ltl;
        let tempPoint;
        
        // getting lowest then leftmost point
        ltl = 0;
        for(let i = 0; i < points.length; i++){
            if( ltl == i ) continue;

            if(points[i].y < points[ltl].y || (points[i].y === points[ltl].y && points[i].x < points[ltl].x) ){
                ltl = i;
            }
        }

        // placing ltl as first
        tempPoint = points[ltl];
        points[ltl] = points[0];
        points[0] = tempPoint;

        // ordering by polar angle
        for(let i = 1; i < points.length; i++){
            for(let j = 1; j < points.length - 1; j++){

                stroke('green');
                strokeWeight(1);
                line(points[0].x, points[0].y, points[j].x, points[j].y);

                if( !toLeft(points[0], points[j], points[j + 1]) ){
                    tempPoint = points[j];
                    points[j] = points[j + 1];
                    points[j + 1] = tempPoint;
                }
            }
        }

    } else {
        // drawing convex hull
        drawConvexHull();
    }

    // drawing points added by user
    drawPoints();

    // showing amount of points
    drawText(`Points: ${points.length}`, 15, 15);
}

// drawing functions

// draws text
function drawText(sentence, x, y){
    textAlign(LEFT, TOP);
    textSize(10);
    textStyle(BOLD);
    strokeWeight(0);
    fill('black');
    text(sentence, x, y);
}

// draws all the points with indexes
function drawPoints(){
    let pointIndex = 0;
    points.forEach( point => {
        stroke('black');
        strokeWeight(2);
        fill('white');
        ellipse(point.x, point.y, 18);

        // showing point index
        if(descriptiveMode){
            strokeWeight(0);
            fill('black');
            textSize(12);
            textAlign(CENTER, CENTER);
            text(pointIndex, point.x, point.y);
            pointIndex++;
        }
    });
}

// draws the convex hull
function drawConvexHull(){
    stroke('brown');
    strokeWeight(2);
    for(let i = 0; i < extremePoints.length - 1; i++)
        line(extremePoints[i].x, extremePoints[i].y, extremePoints[i + 1].x, extremePoints[i + 1].y);

    if(extremePoints.length != 0)
        line(extremePoints[0].x, extremePoints[0].y, extremePoints[extremePoints.length - 1].x, extremePoints[extremePoints.length - 1].y);
}

// handling mouseClick
function mousePressed(){
    if(mouseX <= width && mouseX >= 0 && mouseY >= 0 && mouseY <= height && mouseButton === LEFT){
        points.push( { x: mouseX, y: mouseY } );

        if(autoScan && !descriptiveMode)
            extremePoints = grahamScan();
    }
}

// calculates area given by the last inserted points
function triangleArea(a, b, c){
    return (a.x * b.y - a.y * b.x    +
            b.x * c.y - b.y * c.x   +
            c.x * a.y - c.y * a.x   ) * - 1;
}

// makes an orientation test, returns true if third point is to left of ab segment
function toLeft(a, b, c){
    area = triangleArea(a, b, c);
    return area > 0;
}

// returns the point with the lowest y coordinate
function lowestThenLeftmost(){
    let index = 0;

    for(let i = 0; i < points.length; i++){
        if(points[i].y < points[index].y ||
            (points[i].y == points[index].y && points[i].x < points[index].x) )
            index = i;
    }

    return index;
}

// sorts points by polar angle
function sortByPolarAngle(){
    let ltl = lowestThenLeftmost();

    // setting htl as first point
    let tempPoint = points[ltl];
    points[ltl] = points[0];
    points[0] = tempPoint;

    let sortedPoints = [];
    sortedPoints.push(points[0]);
    points = mergeSort(points.slice(1), points[0]);
    points = [...sortedPoints, ...points];
}

// process grahamScan
function grahamScan(){
    let t = [];
    let s = [];

    if(points.length >= 3){
        sortByPolarAngle();

        s.push(points[0]);
        s.push(points[1]);

        for(let i = points.length - 1; i > 1; i--)
            t.push(points[i]);

        while( t.length != 0 && s.length != 0)
            if( toLeft( s[s.length - 2], s[s.length - 1], t[t.length - 1] ) )
                s.push(t.pop());
            else
                s.pop();
    }

    return s;
}

// merge sort
function merge(left, right, ltl){
    const sortedArr = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while( leftIndex < left.length && rightIndex < right.length ){

        const leftElement = left[leftIndex];
        const rightElement = right[rightIndex];

        if( !toLeft(ltl, leftElement, rightElement) ){
            sortedArr.push(rightElement);
            rightIndex++;
        } else {
            sortedArr.push(leftElement);
            leftIndex++;
        }

    }

    return [...sortedArr, ...left.slice(leftIndex), ...right.slice(rightIndex)];
}

function mergeSort(pointSet, ltl){
    if(pointSet.length <= 1){
        return pointSet;
    }

    const middleIndex = Math.floor( pointSet.length / 2 );
    const left = pointSet.slice(0, middleIndex);
    const right = pointSet.slice(middleIndex);

    return merge( mergeSort(left, ltl), mergeSort(right, ltl), ltl );
}