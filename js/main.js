;(function(){
	'user strict';
	
	var Event = new Vue();
	
	var alert_sound = document.getElementById("alert_sound")
	function copy(obj){
		return Object.assign({},obj);
	}
	
	Vue.component('task',{
		template:'#task-tpl',
		props:['todo'],
		methods:{
			action:function(name, params){
				Event.$emit(name, params);
			}
		}
	})
	new Vue({
		el:'#main',
		data:{
			list:[],
			current:{}
		},
		mounted:function(){
			var me = this;
			this.list = ms.get('list') || this.list;
			
			setInterval(function(){
				me.check_alerts();
			},1000)
			Event.$on('remove',function (id) {
				if (id) {
					me.remove(id)
				}
			});
			Event.$on('toggle_complete',function (id) {
				if (id) {
					me.toggle_complete(id)
				}
			});
			Event.$on('set_current',function (id) {
				if (id) {
					me.set_current(id)
				}
			});
		},
		methods:{
			check_alerts:function () {
				var me = this;
				this.list.forEach(function(row,i){
					var alert_at = row.alert_at;
					if (!alert_at || row.alert_confirmed) {
						return;
					}
					var alert_at = (new Date(alert_at)).getTime();
					var now = (new Date()).getTime();
					
					if (now >= alert_at) {
						alert_sound.play();
						var confirmed = confirm(row.title);
						Vue.set(me.list[i],'alert_confirmed',confirmed)
					}
				})
			},
			merge:function(){ //添加事件和更新事件
				var is_update, id;
				is_update = id = this.current.id;
				
				if (is_update) {
					var index = this.find_index(id);
					
					Vue.set(this.list, index,copy(this.current))
				} else{
					var title = this.current.title;
					 if (!title && title !== 0) {  //判断输入的值是否为空
					 	return;
					}
					 
					var todo = copy(this.current) //Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
					todo.id = this.next_id();
					this.list.push(todo);  //将输入的数值添加进list数组中
				}
				
				this.reset_current()
			},
			remove:function(id){ //删除事件
				var index = this.find_index(id);
				this.list.splice(index,1)
			},
			next_id:function(){
				return this.list.length + 1
			},
			set_current:function(todo){
				this.current = copy(todo)
			},
			reset_current:function(){
				this.set_current({});
			},
			find_index:function  (id) {
				return this.list.findIndex(function(item){
					return item.id == id;
				})
			},
			toggle_complete:function (id) {
				var i = this.find_index(id);
				Vue.set(this.list[i],'completed', !this.list[i].completed)
			},
		},
		
		watch:{
			list:{
				deep:true,
				handler:function(n, o){
					if (n) {
						ms.set('list',n);
					}else{
						me.set('list',[]);
					}
				}
			}
		}
	})
})();
