<template>
  <div id="content">
    <h1>合约地址</h1>
    <div class="text">
     <p><strong>LARK(lark Token)</strong> <br>
       0x4cE8485608F78921Fbc0F96e63c0566B1b176Db0
      </p>

      <p><strong>Lark Pool</strong> <br>
        0xD48cA0B1a9C143c8570e34F5C0dE5a9E29ffB3d3
      </p>

      <p><strong>Delegated Pool</strong> <br>
        0xc75576849fc9A53cE0a510748662CE201F0E3F67
      </p>
			
			<p><strong>Lark Art NFT</strong> <br>
			  0xA338108f5Cac545f1E9E4De1E97D745434104bc7
			</p>
			
			<p><strong>Lark Photograph NFT</strong> <br>
			  0x8148127575a4f1B8587BbDc0cefaa64c1af25D4e
			</p>


      <p><strong>Polygonscan查询：</strong> <br>
        <a target="_blank" href="https://polygonscan.com/token/0x4cE8485608F78921Fbc0F96e63c0566B1b176Db0">https://polygonscan.com/token/0x4cE8485608F78921Fbc0F96e63c0566B1b176Db0</a>
      </p>



    </div>


  </div>
</template>

<script>

  export default {
    name: "Contract",
    data() {
      return {

      }
    },


  }
</script>

<style scoped>
  h1{
    font-size: 2rem;
    text-align: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ddd;
  }
  #content{
    color: rgba(55,53,58,0.75);
    align: center;
    margin: 1rem auto;
    width: 60%;
    padding-bottom: 0.2rem;
  }
  .text{
    line-height: 1.8rem;
  }

  a{
    color: rgba(55,53,58,0.75);
  }

  a:hover{
    color: darkcyan;
    text-decoration: none;
  }

  .btn-outline-primary {
    color: rgba(55,53,58,0.75);
    border-color: rgba(55,53,58,0.75);
  }
  .btn-outline-primary:hover{
    background-color: chocolate;
  }
</style>

