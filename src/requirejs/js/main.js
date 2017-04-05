(function(){
	"use strict" ;
	
//	var models = {
//		baseUrl: "js/model",
//		pahts: {
//			model1: "a",
//			model2: "b",
//			model3: "c"
//		},
//		shim: {
//			
//		}
//	};
//	require.config(models,function(a,b,c){
//		alert(a.add(1,1));
//		
//	});

	require(["model/b"],function(b){
		alert(b.del(1,2));
	})
	
}())
