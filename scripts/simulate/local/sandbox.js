const { NodeVM, VMScript } = require("vm2")

const functions = require("./Functions")

async function evaluate(code, args, secrets) {
  const functionsModule = new functions.FunctionsModule((url) => url, null)
  const Functions = functionsModule.buildFunctionsmodule(5)
  const vm = new NodeVM({
    sandbox: { args, Functions, secrets },
    eval: false,
    require: {
      builtin: ["buffer", "crypto", "querystring", "string_decoder", "url", "util"],
    },
  })
  
  const script = new VMScript("module.exports = async function () {\n" + code + "\n}").compile()
  const func = await vm.run(script)
  const result = await func()
  const formattedResult = BigInt("0x" + result.toString("hex").slice(2).slice(-64)).toString()
  return formattedResult
}

const signedInt256toBigInt = (hex) => {
  const binary = BigInt(hex).toString(2).padStart(256, "0")
  // if the first bit is 0, number is positive
  if (binary[0] === "0") {
    return BigInt(hex)
  }
  return -(BigInt(2) ** BigInt(255)) + BigInt(`0b${binary.slice(1)}`)
}

module.exports = evaluate
