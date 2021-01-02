// ★STEP2
// https://jp.vuejs.org/v2/examples/todomvc.html
var STORAGE_KEY = 'todos-vuejs-demo'
var todoStorage = {
  fetch: function () {
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    todos.forEach(function (todo, index) {
      todo.id = index
    })
    todoStorage.uid = todos.length
    return todos
  },
  save: function (todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}


// ★STEP1
var app = new Vue({
  el: '#app',
  data: {
    isSheat:true,isCreate:false,isFinish:false,
    // ★STEP5 localStorage から 取得した ToDo のリスト
    todos: [],
    // ★STEP11 抽出しているToDoの状態
    current: -1,
    // ★STEP11＆STEP13 各状態のラベル
    keyword: "",
    mtr_name: "",
    tickets: [],
    devices: [],
    materials:[],
    r_src:[],
    options: [
      { value: -1, label: 'すべて' },
      { value: 0 , label: '作成中' },
      { value: 1, label: '作成済' }
    ]
  },

  computed: {
    // ★STEP12

    computedCreate: function () {
      return this.todos.filter(function (el) {
        return el.state == 0
      }, this)
    },
    computedFinish: function () {
      return this.todos.filter(function (el) {
        return el.state == 1
      }, this)
    },
    computedResource: function () {
      sources = [];
      this.todos.filter(function (el) {
        return el.state == 0
      }, this).forEach( function(e){
        if(typeof(sources[e.comment.rsrc]) == "undefined"){
          sources[e.comment.rsrc] = 0;
        }
        sources[e.comment.rsrc] += Number(e.comment.rsrc_num)
      })
      str = "";
      for( key in sources ) {
        str += key + sources[key]+" ";
      }

      return str;
    },
    
    computedTiketSum: function () {
      sum = 0;
      target = this.todos.filter(function (el) {
        return el.state == 0
      }, this)//.map(x => x.comment.ticket.map(el =>{ sum += el }))

      for(i = 0; i < target.length;i++){
        this.tickets.forEach( function(e){
          array = e.split('-');
        
          if( array[0] == target[i].id) {
            sum += target[i].comment.ticket[[array[1]]];
          }
        })
      }
      return sum;
    },
    computedOrbit: function () {

      sum = 0;
      target = this.todos.filter(function (el) {
        return el.state == 0
      }, this)//.map(x => x.comment.ticket.map(el =>{ sum += el }))

      for(i = 0; i < target.length;i++){
        this.tickets.forEach( function(e){
          array = e.split('-');
          if( array[0] == target[i].id) {
            sum += target[i].comment.ticket[[array[1]]];
          }
        })
      }
      return Math.ceil(sum/327);
    },

    computedMiraCost: function () {
      return this.todos.filter(function (el) {
        return el.state == 0
      }, this).map(x => x.comment.cost).reduce((a,x) => a+=x,0);
    },

    // ★STEP13 作業中・完了のラベルを表示する
    labels() {
      return this.options.reduce(function (a, b) {
        return Object.assign(a, { [b.value]: b.label })
      }, {})
      // キーから見つけやすいように、次のように加工したデータを作成
      // {0: '作業中', 1: '完了', -1: 'すべて'}
    },
    matcheMaterial: function () {
      var devices = [];
      var keyword = this.keyword.trim();
      var mtr_name = this.mtr_name.trim();
      if(this.mtr_name.length > 1) {
        for(var i in this.devices) {
            var device = this.devices[i];
            t = [];
            device.type.forEach( type =>{
              if(type.materials.join('').match(new RegExp(this.mtr_name,'i'))){
                t.push(type)
                // console.log(t);
              }
            })
            if(t.length !== 0) {
              device.type = t;
              devices.push(device);
            }
        }
      }
      else {
        devices = this.devices;
      }
      return devices.filter(function (el) {
        if( keyword.length == 0)
          return el;
        else 
          return el.device.match(new RegExp(keyword.trim(),'i'))
      });
    }
  },

  // ★STEP8
  watch: {
    // オプションを使う場合はオブジェクト形式にする
    todos: {
      // 引数はウォッチしているプロパティの変更後の値
      handler: function (todos) {
        todoStorage.save(todos)
      },
      // deep オプションでネストしているデータも監視できる
      deep: true
    }
  },

  // ★STEP9
  created() {
    // インスタンス作成時に自動的に fetch() する
      this.todos = todoStorage.fetch()
      var self = this;
      axios
          .get('./device.json')
          .then(function(response) {
              self.devices = response.data;
          })
          .catch(function(error) {
              console.log('取得に失敗しました。', error);
          })
  
        axios
          .get('./material.json')
          .then(function(response) {
              self.materials = response.data;
          })
          .catch(function(error) {
              console.log('取得に失敗しました。', error);
          })
  },

  methods: {

    // ★STEP7 ToDo 追加の処理
    doAdd: function(device,value) {
      // { 新しいID, コメント, 作業状態 }
      // というオブジェクトを現在の todos リストへ push
      // 作業状態「state」はデフォルト「作業中=0」で作成
      value.ticket = [];
      for( i = 0; i < value.materials.length; i++ ) {
        // console.log(i);
        // console.log(this.materials[value.materials[i]].ticket);
        value.sum_ticket = 0,
        value.ticket[i] = this.materials[value.materials[i]].ticket * value.material_num[i];
        if( this.materials[value.materials[i]].trade ){
          this.tickets.push(todoStorage.uid+"-"+i);
        }
      }
      value.ticket_def = value.ticket;
      this.todos.push({
        id: todoStorage.uid++,
        device: device.device,
        cate: device.class+"/"+device.feat,
        comment: value,
        state: 0
      })
    },
    // addTiket: function(value,check) {
      
    // },
    sumsTickets: function(array_data) {
      return array_data.reduce((p, x) => p + x, 0)
    },
    // ★STEP10 状態変更の処理
    doChangeState: function (item) {
      item.state = !item.state ? 1 : 0
    },

    // ★STEP10 削除の処理
    doRemove: function (item) {
      var index = this.todos.indexOf(item)
      this.todos.splice(index, 1)
    }
  },
})