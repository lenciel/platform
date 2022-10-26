//
// Copyright © 2022 Hardcore Engineering Inc.
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

import { Builder } from '@hcengineering/model'

import core from '@hcengineering/core'
import serverTask from '@hcengineering/server-task'
import task from '@hcengineering/task'
import serverNotification from '@hcengineering/server-notification'

export function createModel (builder: Builder): void {
  builder.mixin(task.class.Issue, core.class.Class, serverNotification.mixin.HTMLPresenter, {
    presenter: serverTask.function.IssueHTMLPresenter
  })

  builder.mixin(task.class.Issue, core.class.Class, serverNotification.mixin.TextPresenter, {
    presenter: serverTask.function.IssueTextPresenter
  })
}
