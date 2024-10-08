import decompress from 'decompress'
import path from 'path'

export class UnzipKeplrExtension {
  getPathToKeplrExtension() {
    console.log('\nUnzip Keplr Wallet Extension before tests.')
    const pathToZip = path.join(
      __dirname,
      './keplr-extension-manifest-v3-v0.12.125.zip',
    )
    const pathToExtension = path.join(__dirname, './keplr-extension-manifest')
    decompress(pathToZip, pathToExtension)
    return pathToExtension
  }

  getPathToMetaMaskExtension() {
    console.log('\nUnzip MetaMask Wallet Extension before tests.')
    const pathToZip = path.join(__dirname, './metamask-chrome-12.2.4.zip')
    const pathToExtension = path.join(
      __dirname,
      './metamask-extension-manifest',
    )
    decompress(pathToZip, pathToExtension)
    return pathToExtension
  }

  getPathToPhantomExtension() {
    console.log('\nUnzip Phantom Wallet Extension before tests.')
    const pathToZip = path.join(__dirname, './phantom-extension-24.15.0.zip')
    const pathToExtension = path.join(
      __dirname,
      './phantom-extension-manifest',
    )
    decompress(pathToZip, pathToExtension)
    return pathToExtension
  }
}
