// Copyright © 2020, 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.

import { Class, Doc, Mixin, Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Application, Space, VDoc } from '@anticrm/domains'
import { ComponentExtension } from '@anticrm/presentation'
import { AnyComponent, getPlatform } from '@anticrm/platform-ui'

export interface FSM extends VDoc {
  name: string
  application: Ref<Application>
  classes: Array<Ref<Class<VDoc>>>
  isTemplate: boolean
}

export interface Transition extends VDoc {
  from: Ref<State>
  to: Ref<State>
  fsm: Ref<FSM>

  // Actual action usage TBD
  // action: Ref<Action>
}

export interface WithFSM extends Doc {
  fsm: Ref<FSM>
}

// TODO: replace with class represents "Card",
// that would refer to fsm, target object and have
// state, like:
// {
//    fsm: Ref<WithFSM>
//    target: Ref<VDoc>
//    state: Ref<State>
// }
export interface WithState extends Doc {
  // Undefined FSM means doc is not part of FSM
  // Probably we need to be able to unmixin
  fsm?: Ref<WithFSM>
  state: Ref<State>
}

export interface State extends VDoc {
  name: string
  fsm: Ref<FSM>
}

export interface FSMService extends Service {
  getStates: (fsm: FSM) => Promise<State[]>
  getTransitions: (fsm: FSM) => Promise<Transition[]>

  updateFSM: (fsm: FSM, transitions: Transition[], states: State[]) => Promise<void>
  duplicateFSM: (fsm: Ref<FSM>) => Promise<FSM | undefined>
}

const fsmPlugin = plugin(
  'fsm' as Plugin<FSMService>,
  { core: core.id },
  {
    class: {
      FSM: '' as Ref<Class<FSM>>,
      Transition: '' as Ref<Class<Transition>>,
      State: '' as Ref<Class<State>>
    },
    mixin: {
      WithFSM: '' as Ref<Mixin<WithFSM>>,
      WithState: '' as Ref<Mixin<WithState>>,
      CardForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>
    },
    component: {
      BoardPresenter: '' as AnyComponent,
      VDocCardPresenter: '' as AnyComponent
    },
    space: {
      Common: 'space:fsm.Common' as Ref<Space>
    }
  }
)

export default fsmPlugin

export const getFSMService = async (): Promise<FSMService> =>
  await getPlatform().getPlugin(fsmPlugin.id)
