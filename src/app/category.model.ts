import { Wallet } from "thred-core"


export class Category{

  name!: string
  id!: string
  utils!: Wallet[]
  cols!: number

  constructor(name: string, id: string, utils: Wallet[], cols: number){
    this.name = name ?? "New"
    this.id = id
    this.utils = utils ?? []
    this.cols = cols ?? 3
  }
}