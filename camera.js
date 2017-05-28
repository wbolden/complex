function camera() {

	this.ortho = new Matrix4().setOrtho(-1,1, -1, 1, 1, 7);
    this.perspective = new Matrix4().setPerspective(60, 1, 0.1, 7);//.translate(0, 0, -2.0);

    this.fov = 60;

    this.applied_trans = new Matrix4().translate(0, 0, -2.0);;
    this.trans = new Matrix4();
    //this.rot = new Matrix4();

    this.apply_trans = function(){
    	this.applied_trans = this.trans.multiply(this.applied_trans);
    	this.trans = new Matrix4();
    }

    this.set_trans = function(trans) {
    	this.trans = new Matrix4().set(trans);
    }

    this.add_fov = function(delta_fov) {
    	this.set_fov(this.fov + delta_fov);
    }

    this.set_fov = function(fov) {
    	if(!(fov > 1 && fov < 179)) return;

    	this.fov = fov;
    	this.perspective = new Matrix4().setPerspective(fov, 1, 0.1, 7);
    }


	this.getProjmat = function() {
		var proj = new Matrix4();
		var trans = new Matrix4();
		var rot = new Matrix4();

		trans.set(this.trans);

		trans = trans.multiply(this.applied_trans);

		//rot.set(this.rot);

	    if(showOrtho) {
	        proj.set(this.ortho);
	    } else {
	    	proj.set(this.perspective);
	    }

	    proj = proj.multiply(trans);
	
	//  console.log(proj.elements);
	    return proj;
	}
}