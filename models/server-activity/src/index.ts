//
// Copyright © 2023 Hardcore Engineering Inc.
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
//

import { type Builder } from '@hcengineering/model'
import serverCore from '@hcengineering/server-core'
import core from '@hcengineering/core/lib/component'
import serverActivity from '@hcengineering/server-activity'

export { activityServerOperation } from './migration'
export { serverActivityId } from '@hcengineering/server-activity'

export function createModel (builder: Builder): void {
  // NOTE: temporarily disabled
  // builder.createDoc(serverCore.class.Trigger, core.space.Model, {
  //   trigger: serverNotification.trigger.OnReactionChanged,
  //   txMatch: {
  //     collection: 'reactions',
  //     objectClass: activity.class.ActivityMessage,
  //     _class: core.class.TxCollectionCUD
  //   }
  // })

  builder.createDoc(serverCore.class.Trigger, core.space.Model, {
    trigger: serverActivity.trigger.ActivityMessagesHandler
  })
}
