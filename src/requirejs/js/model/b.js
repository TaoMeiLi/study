define("model/b",["model/a"],function(a){       //"model/b"代表文件本身
	var del = function(x,y){
		return a.add(x,y);
	};
	return{
		del:del
	}
})
