import delegate from '../../../public/DelegatedPool.json'

const getDelegateInstance = async function(){
  let instance = new this.web3.eth.Contract(delegate.abi, this.delegatedPool)
  // console.log(289, 'hammer',instance)

  //将得到的数据存入vuex中
  this.$store.commit('saveDelegateInstance', instance)

  let instance2 = new this.web4.eth.Contract(delegate.abi, this.delegatedPool)

  // let s = await instance2.methods.totalSupply().call()
  // console.log(999, s)
  // console.log(288, instance2)
  //将得到的数据存入vuex中
  this.$store.commit('saveDelegateInstance2', instance2)
}

export {getDelegateInstance}
