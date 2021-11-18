import { formatUnits } from '@ethersproject/units';
import { multicall } from '../../utils';

export const author = 'Arr00';
export const version = '0.1.0';

const abi = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'getCurrentVotes',
    outputs: [
      {
        internalType: 'uint96',
        name: '',
        type: 'uint96'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },

  {
    inputs: [
      {
        internalType:"address",
        name:"user",
        type:"address"
      },
      {
        internalType:"address",
        name:"token",
        type:"address"
      }
    ],

    name : "balanceOf",
    outputs: [
      {
         "internalType":"uint256",
         "name":"",
         "type":"uint256"
      }
    ],

    stateMutability: "view",  
    type: "function"
  }

];

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) {
  const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
  const responseDelegatedVotes = await multicall(
    network,
    provider,
    abi,
    addresses.map((address: any) => [
      options.epnsTokenAddr,
      'getCurrentVotes',
      [address.toLowerCase()]
    ]),
    { blockTag }
  );

  const responseStakedPUSH =  await multicall(
    network,
    provider,
    abi,
    addresses.map((address: any) => [
      options.stakingAddr,
      'balanceOf',
      [address.toLowerCase(), options.epnsTokenAddr]
    ]),
    { blockTag }
  );
  


  console.log("Staked $PUSH score:\n", responseStakedPUSH.map((value, i) => [
    addresses[i],
    parseFloat(formatUnits(value.toString(), options.decimals))
  ]));

  const responseStakedLP = await multicall(
    network,
    provider,
    abi,
    addresses.map((address: any) => [
      options.stakingAddr,
      'balanceOf',
      [address.toLowerCase(), options.epnsLPTokenAddr]
    ]),
    {blockTag}
  );


  console.log("Staked LP-PUSH score:\n", responseStakedLP.map((value, i) => [
    addresses[i],
    parseFloat(formatUnits(value.toString(), options.decimals))
  ]));




  return Object.fromEntries(
    responseDelegatedVotes.map((value, i) => [
      addresses[i],
      parseFloat(formatUnits(value.toString(), options.decimals))
    ])
  );
}
