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

import {
  Account,
  AnyAttribute,
  AttachedDoc,
  Class,
  Doc,
  DocumentQuery,
  Mixin,
  Ref,
  Space,
  Timestamp,
  Tx,
  TxCUD
} from '@hcengineering/core'
import type { Asset, IntlString, Plugin, Resource } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import { IntegrationType } from '@hcengineering/setting'
import { AnyComponent, Location, ResolvedLocation } from '@hcengineering/ui'
import { Readable, Writable } from './types'
import { Preference } from '@hcengineering/preference'
import { Action } from '@hcengineering/view'
import { ActivityMessage } from '@hcengineering/activity'

export * from './types'

/**
 * @public
 */
export interface Notification extends AttachedDoc {
  tx: Ref<TxCUD<Doc>>
  status: NotificationStatus
  text: string
  type: Ref<NotificationType>
}

/**
 * @public
 */
export enum NotificationStatus {
  New,
  Notified,
  Read
}

/**
 * @public
 */
export interface NotificationGroup extends Doc {
  label: IntlString
  icon: Asset
  // using for autogenerated settings
  objectClass?: Ref<Class<Doc>>
}

/**
 * @public
 */
export interface NotificationPreferencesGroup extends Doc {
  label: IntlString
  icon: Asset
  presenter: AnyComponent
}

/**
 * @public
 */
export interface NotificationTemplate {
  textTemplate: string
  htmlTemplate: string
  subjectTemplate: string
}

/**
 * @public
 */
export interface NotificationContent {
  title: IntlString
  body: IntlString
  intlParams: Record<string, string | number>
  intlParamsNotLocalized?: Record<string, IntlString>
}

/**
 * @public
 */
export interface NotificationType extends Doc {
  // For show/hide with attributes
  attribute?: Ref<AnyAttribute>
  // Is autogenerated
  generated: boolean
  // allowed to to change setting (probably we should show it, but disable toggle??)
  hidden: boolean
  label: IntlString
  group: Ref<NotificationGroup>
  txClasses: Ref<Class<Tx>>[]
  objectClass: Ref<Class<Doc>>
  // not allowed to parent doc
  onlyOwn?: boolean
  // check parent doc class
  attachedToClass?: Ref<Class<Doc>>
  // use for update/mixin txes
  field?: string
  txMatch?: DocumentQuery<Tx>
  // use for space collaborators, not object
  spaceSubscribe?: boolean
  // allowed providers and default value for it
  providers: Record<Ref<NotificationProvider>, boolean>
  // templates for email (and browser/push?)
  templates?: NotificationTemplate
  // when true notification will be created for user which trigger it (default - false)
  allowedForAuthor?: boolean
}

/**
 * @public
 */
export interface NotificationProvider extends Doc {
  label: IntlString
}

/**
 * @public
 */
export interface NotificationSetting extends Preference {
  attachedTo: Ref<NotificationProvider>
  type: Ref<NotificationType>
  enabled: boolean
}

/**
 * @public
 */
export interface ClassCollaborators extends Class<Doc> {
  fields: string[] // Ref<Account> | Ref<Employee> | Ref<Account>[] | Ref<Employee>[]
}

/**
 * @public
 */
export interface NotificationObjectPresenter extends Class<Doc> {
  presenter: AnyComponent
}

/**
 * @public
 */
export interface Collaborators extends Doc {
  collaborators: Ref<Account>[]
}

/**
 * @public
 */
export interface DocUpdateTx {
  _id: Ref<TxCUD<Doc>>
  modifiedBy: Ref<Account>
  modifiedOn: Timestamp
  isNew: boolean
  title?: IntlString
  body?: IntlString
  intlParams?: Record<string, string | number>
  intlParamsNotLocalized?: Record<string, IntlString>
}

/**
 * @public
 */
export interface DocUpdates extends Doc {
  user: Ref<Account>
  attachedTo: Ref<Doc>
  attachedToClass: Ref<Class<Doc>>
  hidden: boolean
  lastTxTime?: Timestamp
  txes: DocUpdateTx[]
}

/**
 * @public
 */
export const notificationId = 'notification' as Plugin

/**
 * @public
 */
export const inboxId = 'inbox' as Plugin

/**
 * @public
 */
export interface NotificationClient {
  docUpdatesStore: Writable<Map<Ref<Doc>, DocUpdates>>
  docUpdates: Writable<DocUpdates[]>
  read: (_id: Ref<Doc>) => Promise<void>
  forceRead: (_id: Ref<Doc>, _class: Ref<Class<Doc>>, space: Ref<Space>) => Promise<void>
}

/**
 * @public
 */
export interface NotificationPreview extends Class<Doc> {
  presenter: AnyComponent
}

/**
 * @public
 */
export type NotificationClientFactoy = () => NotificationClient

/**
 * @public
 */
export interface InboxNotification extends Doc {
  user: Ref<Account>
  isViewed: boolean

  attachedTo: Ref<ActivityMessage>
  attachedToClass: Ref<Class<ActivityMessage>>

  docNotifyContext: Ref<DocNotifyContext>
}

/**
 * @public
 */
export interface DocNotifyContext extends Doc {
  user: Ref<Account>

  // Context
  attachedTo: Ref<Doc>
  attachedToClass: Ref<Class<Doc>>

  hidden: boolean
  lastViewedTimestamp?: Timestamp
  lastUpdateTimestamp?: Timestamp
}

/**
 * @public
 */
export interface InboxNotificationsClient {
  docNotifyContextByDoc: Writable<Map<Ref<Doc>, DocNotifyContext>>
  docNotifyContexts: Writable<DocNotifyContext[]>
  inboxNotifications: Writable<InboxNotification[]>
  inboxNotificationsByContext: Readable<Map<DocNotifyContext, InboxNotification[]>>
  readDoc: (_id: Ref<Doc>) => Promise<void>
  readMessages: (ids: Ref<ActivityMessage>[]) => Promise<void>
  unreadMessages: (ids: Array<Ref<ActivityMessage>>) => Promise<void>
  deleteMessagesNotifications: (ids: Array<Ref<ActivityMessage>>) => Promise<void>
}

/**
 * @public
 */
export type InboxNotificationsClientFactory = () => InboxNotificationsClient

/**
 * @public
 */
const notification = plugin(notificationId, {
  mixin: {
    ClassCollaborators: '' as Ref<Mixin<ClassCollaborators>>,
    Collaborators: '' as Ref<Mixin<Collaborators>>,
    NotificationObjectPresenter: '' as Ref<Mixin<NotificationObjectPresenter>>,
    NotificationPreview: '' as Ref<Mixin<NotificationPreview>>
  },
  class: {
    Notification: '' as Ref<Class<Notification>>,
    NotificationType: '' as Ref<Class<NotificationType>>,
    NotificationProvider: '' as Ref<Class<NotificationProvider>>,
    NotificationSetting: '' as Ref<Class<NotificationSetting>>,
    DocUpdates: '' as Ref<Class<DocUpdates>>,
    NotificationGroup: '' as Ref<Class<NotificationGroup>>,
    NotificationPreferencesGroup: '' as Ref<Class<NotificationPreferencesGroup>>,
    DocNotifyContext: '' as Ref<Class<DocNotifyContext>>,
    InboxNotification: '' as Ref<Class<InboxNotification>>
  },
  ids: {
    NotificationSettings: '' as Ref<Doc>,
    NotificationGroup: '' as Ref<NotificationGroup>,
    CollaboratoAddNotification: '' as Ref<NotificationType>
  },
  providers: {
    PlatformNotification: '' as Ref<NotificationProvider>,
    BrowserNotification: '' as Ref<NotificationProvider>,
    EmailNotification: '' as Ref<NotificationProvider>
  },
  integrationType: {
    MobileApp: '' as Ref<IntegrationType>
  },
  component: {
    Inbox: '' as AnyComponent,
    NewInbox: '' as AnyComponent,
    NotificationPresenter: '' as AnyComponent,
    NotificationCollaboratorsChanged: '' as AnyComponent
  },
  activity: {
    TxCollaboratorsChange: '' as AnyComponent
  },
  action: {
    MarkAsUnreadInboxNotification: '' as Ref<Action>,
    MarkAsReadInboxNotification: '' as Ref<Action>,
    DeleteInboxNotification: '' as Ref<Action>
  },
  icon: {
    Notifications: '' as Asset,
    Inbox: '' as Asset,
    Track: '' as Asset,
    DontTrack: '' as Asset,
    Hide: '' as Asset
  },
  space: {
    Notifications: '' as Ref<Space>
  },
  string: {
    Notification: '' as IntlString,
    Notifications: '' as IntlString,
    DontTrack: '' as IntlString,
    Inbox: '' as IntlString,
    CommonNotificationTitle: '' as IntlString,
    CommonNotificationBody: '' as IntlString,
    ChangedCollaborators: '' as IntlString,
    NewCollaborators: '' as IntlString,
    RemovedCollaborators: '' as IntlString,
    Edited: '' as IntlString
  },
  function: {
    GetNotificationClient: '' as Resource<NotificationClientFactoy>,
    GetInboxNotificationsClient: '' as Resource<InboxNotificationsClientFactory>
  },
  resolver: {
    Location: '' as Resource<(loc: Location) => Promise<ResolvedLocation | undefined>>
  }
})

export default notification
