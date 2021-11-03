import pool from '../../../public/LarkPool.json'

const getPoolInstance = async function(){
  let instance = new this.web3.eth.Contract(pool.abi, this.larkPool)
  // console.log(289, 'hammer',instance)

  //将得到的数据存入vuex中
  this.$store.commit('savePoolInstance', instance)

  let instance2 = new this.web4.eth.Contract(pool.abi, this.larkPool)
  // let s = await instance2.methods.totalSupply().call()
  // console.log(999, s)
  // console.log(288, 'tsteem',instance)
  //将得到的数据存入vuex中
  this.$store.commit('savePoolInstance2', instance2)
}

export {getPoolInstance}
