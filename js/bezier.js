/**
 * Bezier is a set of functions that create bezier curve on canvas
 * Your code needs to go into a bunch of spaces here 
 */

function Bezier () {

    this.control_points = [];
    this.current_points = [];
    this.curve_mode = "Basic";
    this.continuity_mode = "C0";
    this.subdivide_level = 0;
    this.piecewise_degree = 1;
    this.Decasteljau_step = 0;
    this.t = 0.5;
    this.samples = 20;

    /** ---------------------------------------------------------------------
     * Evaluate the Bezier curve at the given t parameter
     * @param t Given t parameter
     * @return Vec2 The location of point at given t parameter
     */
    this.evaluate = function (t) {
        var my_bezier = new Vec2();
        if (t >= 0.0 && t <= 1.000005) {
            if (this.current_points.length > 1) {

                // You may find the following functions useful"
                //  - this.nChooseK(m, i) computes "m choose i", aka: (m over i)
                //  - Math.pow(t, i) computes t raised to the power i

                    //@@@@@
                    const m = this.current_points.length - 1;
                    for (var i=0; i<=m; i++) {
                        my_bezier = sum(my_bezier, this.current_points[i].scale(this.nChooseK(m, i) * Math.pow(t, i) * Math.pow(1-t, m-i)));
                    }
                    //@@@@@
            }
        }
        return my_bezier;
    };

    /** ---------------------------------------------------------------------
     * Subdivide this Bezier curve into two curves
     * @param curve1 The first curve
     * @param curve2 The second curve
     */
    this.subdivide = function (curve1, curve2) {
        //@@@@@
        let helper = function (curr_points) {
            let new_points = [];
            if (curr_points.length === 2) {
                new_points.push(curr_points[0]);
                new_points.push(sum(curr_points[0], curr_points[1]).scale(0.5));
                new_points.push(curr_points[1]);
            } else {
                let points = [];
                for (let i=0; i<curr_points.length-1; i++){
                    points.push(sum(curr_points[i], curr_points[i+1]).scale(0.5));
                }
                new_points.push(curr_points[0]);
                new_points = new_points.concat(helper(points));
                new_points.push(curr_points[curr_points.length-1]);
            }
            return new_points;
        }

        let divided_points = helper(this.control_points);
        curve1.control_points = divided_points.slice(0,this.control_points.length);
        curve2.control_points = divided_points.slice(this.control_points.length-1, this.control_points.length*2-1);
        //@@@@@
    };


    /** ---------------------------------------------------------------------
     * Draw line segment between point p1 and p2
     */
     this.drawLine = function (p1, p2) {
        this.gl_operation.drawLine(p1, p2);
    };

    
    /** ---------------------------------------------------------------------
     * Draw this Bezier curve
     */
    this.drawCurve = function () {
        if (this.control_points.length >= 2) {

            if (this.curve_mode == "Basic") {
                // Basic Mode
                //
                // Create a Bezier curve from the entire set of control points,
                // and then simply draw it to the screen

                // Do this by evaluating the curve at some finite number of t-values,
                // and drawing line segments between those points.
                // You may use the this.drawLine() function to do the actual
                // drawing of line segments.

                //@@@@@
                this.current_points = this.control_points;
                for (let i=0; i<1; i+=1/this.samples) {
                    if ((i+1/this.samples)>1) {
                        this.drawLine(this.evaluate(i), this.evaluate(1));
                    } else {
                        this.drawLine(this.evaluate(i), this.evaluate(i+1/this.samples));
                    }
                }
                //@@@@@
            }
            else if (this.curve_mode == "Subdivision") {
                // Subdivision mode
                //
                // Create a Bezier curve from the entire set of points,
                // then subdivide it the number of times indicated by the
                // this.subdivide_level variable.
                // The control polygons of the subdivided curves will converge
                // to the actual bezier curve, so we only need to draw their
                // control polygons.
                //@@@@@
                if (this.subdivide_level === 0) {
                    this.drawControlPolygon();
                } else {
                    let curve1 = new Bezier();
                    let curve2 = new Bezier();
                    curve1.setGL(this.gl_operation);
                    curve2.setGL(this.gl_operation);
                    curve1.setSubdivisionLevel(this.subdivide_level-1);
                    curve2.setSubdivisionLevel(this.subdivide_level-1);
                    curve1.setCurveMode("Subdivision");
                    curve2.setCurveMode("Subdivision");
                    this.subdivide(curve1, curve2);
                    curve1.drawCurve();
                    curve2.drawCurve();
                }
                //@@@@@
            }
            else if (this.curve_mode == "Piecewise") {
                if (this.continuity_mode == "C0")
                {
                    // C0 continuity
                    //
                    // Each piecewise curve should be C0 continuous with adjacent
                    // curves, meaning they should share an endpoint.

                    //@@@@@
                    for (let i=0; i<(this.control_points.length-1)/this.piecewise_degree; i++) {
                        this.current_points = this.control_points.slice(this.piecewise_degree*i, this.piecewise_degree*(i+1)+1)
                        for (let j=0; j<1; j+=1/this.samples) {
                            if ((j+1/this.samples)>1) {
                                this.drawLine(this.evaluate(j), this.evaluate(1));
                            } else {
                                this.drawLine(this.evaluate(j), this.evaluate(j+1/this.samples));
                            }
                        } 
                    }
                    //@@@@@
                }
                else if (this.continuity_mode == "C1")
                {
                    // C1 continuity
                    //
                    // Each piecewise curve should be C1 continuous with adjacent
                    // curves.  This means that not only must they share an endpoint,
                    // they must also have the same tangent at that endpoint.
                    // You will likely need to add additional control points to your
                    // Bezier curves in order to enforce the C1 property.
                    // These additional control points do not need to show up onscreen.

                    //@@@@@
                    let new_points = []
                    for (let i=0; i<this.control_points.length; i++) {
                        new_points.push(this.control_points[i]);
                        if (i>=this.piecewise_degree-1 && i%(this.piecewise_degree-1) === 0 && i<this.control_points.length-2) {
                            new_points.push(sum(this.control_points[i], this.control_points[i+1]).scale(0.5));
                        }
                    }
                    for (let i=0; i<(new_points.length-1)/this.piecewise_degree; i++) {
                        this.current_points = new_points.slice(this.piecewise_degree*i, this.piecewise_degree*(i+1)+1)
                        for (let j=0; j<1; j+=1/this.samples) {
                            if ((j+1/this.samples)>1) {
                                this.drawLine(this.evaluate(j), this.evaluate(1));
                            } else {
                                this.drawLine(this.evaluate(j), this.evaluate(j+1/this.samples));
                            }
                        } 
                    }
                    //@@@@@

                }
            }
            else if (this.curve_mode == "De Casteljau")
            {
                let helper = function (curr_points, step, t) {
                    if (curr_points.length >= 2) {
                        this.gl_operation.drawPoints([curr_points[0]]);
                        for (var i = 0; i < curr_points.length - 1; i++) {
                            this.gl_operation.drawLine(curr_points[i], curr_points[i + 1]);
                            this.gl_operation.drawPoints([curr_points[i+1]]);
                        }
                    } else {
                        this.gl_operation.drawPoints([curr_points[0]]);
                    }
                    if (step > 0) {
                        let points = [];
                        for (let i=0; i<curr_points.length-1; i++){
                            points.push(sum(curr_points[i].scale(1-t), curr_points[i+1].scale(t)));
                        }
                        helper(points, step-1, t);
                    }
                }
                helper(this.control_points, this.Decasteljau_step, this.t);
            }
        }
    };


    /** ---------------------------------------------------------------------
     * Draw control polygon
     */
    this.drawControlPolygon = function () {
        if (this.control_points.length >= 2) {
            for (var i = 0; i < this.control_points.length - 1; i++) {
                this.drawLine(this.control_points[i], this.control_points[i + 1]);
            }
        }
    };

    /** ---------------------------------------------------------------------
     * Draw control points
     */
    this.drawControlPoints = function () {
        this.gl_operation.drawPoints(this.control_points);
    };


    /** ---------------------------------------------------------------------
     * Drawing setup
     */
    this.drawSetup = function () {
        this.gl_operation.drawSetup();
    };


    /** ---------------------------------------------------------------------
     * Compute nCk ("n choose k")
     * WARNING:: Vulnerable to overflow when n is very large!
     */
    this.nChooseK = function (n, k) {
        var result = -1;

        if (k >= 0 && n >= k) {
            result = 1;
            for (var i = 1; i <= k; i++) {
                result *= n - (k - i);
                result /= i;
            }
        }

        return result;
    };


    /** ---------------------------------------------------------------------
     * Setters - set value
     */
    this.setGL = function (gl_operation) {
        this.gl_operation = gl_operation;
    };

    this.setCurveMode = function (curveMode) {
        this.curve_mode = curveMode;
    };

    this.setContinuityMode = function (continuityMode) {
        this.continuity_mode = continuityMode;
    };

    this.setSubdivisionLevel = function (subdivisionLevel) {
        this.subdivide_level = subdivisionLevel;
    };

    this.setPiecewiseDegree = function (piecewiseDegree) {
        this.piecewise_degree = piecewiseDegree;
    };

    this.setDecasteljauStep = function (decasteljauStep) {
        this.Decasteljau_step = decasteljauStep;
    };

    this.setT = function (t) {
        this.t = t;
    };

    this.setSamples = function (piecewiseDegree) {
        this.samples = piecewiseDegree;
    };

    /** ---------------------------------------------------------------------
     * Getters - get value
     */
    this.getCurveMode = function () {
        return this.curve_mode;
    };

    this.getContinuityMode = function () {
        return this.continuity_mode;
    };

    this.getSubdivisionLevel = function () {
        return this.subdivide_level;
    };

    this.getPiecewiseDegree = function () {
        return this.piecewise_degree;
    };

    this.getDecasteljauMax = function () {
        return this.control_points.length-1;
    };

    /** ---------------------------------------------------------------------
     * @return Array A list of control points
     */
    this.getControlPoints = function () {
        return this.control_points;
    };


    /** ---------------------------------------------------------------------
     * @return Vec2 chosen point
     */
    this.getControlPoint = function (idx) {
        return this.control_points[idx];
    };

    /** ---------------------------------------------------------------------
     * Add a new control point
     * @param new_point Vec2 A 2D vector that is added to control points
     */
    this.addControlPoint = function (new_point) {
        this.control_points.push(new_point);
    };

    /** ---------------------------------------------------------------------
     * Remove a control point
     * @param point Vec2 A 2D vector that is needed to be removed from control points
     */
    this.removeControlPoint = function (point) {
        var pos =  this.points.indexOf(point);
        this.control_points.splice(pos, 1);
    };

    /** ---------------------------------------------------------------------
     * Remove all control points
     */
    this.clearControlPoints = function() {
        this.control_points = [];
    };

    /** ---------------------------------------------------------------------
     * Print all control points
     */
    this.printControlPoints = function() {
        this.control_points.forEach(element => {
            element.printVector();
        });
    };
}
