/*
  Copyright 2018 Stratumn SAS. All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/**
 * Components in this package use this interface for logging.
 * You should provide your own implementation of this interface that plugs into
 * your monitoring system.
 * This way you'll get all the events raised from this package's components.
 */
export interface ILogger {
  /**
   * Log information (non-error).
   * This can become noisy so it should usually be disabled in production or
   * randomly sampled.
   * @param event details.
   */
  info(event: any): void;

  /**
   * Log a warning (non-critical error).
   * @param event details.
   */
  warn(event: any): void;

  /**
   * Log an error.
   * @param event details.
   */
  error(event: any): void;
}
