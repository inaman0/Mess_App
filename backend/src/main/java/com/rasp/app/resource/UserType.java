/*
 * Copyright 2010-2020 M16, Inc. All rights reserved.
 * This software and documentation contain valuable trade
 * secrets and proprietary property belonging to M16, Inc.
 * None of this software and documentation may be copied,
 * duplicated or disclosed without the express
 * written permission of M16, Inc.
 */

package com.rasp.app.resource;

import platform.webservice.BasePossibleValue;
import platform.webservice.Enum;

/*
 ********** This is a generated class Don't modify it.Extend this file for additional functionality **********
 * 
 */
public class UserType extends BasePossibleValue {
		public static String ID_Admin = "Admin";
		public static String NAME_Admin = "Admin";
		public static String ID_User = "User";
		public static String NAME_User = "User";
		public UserType() {super("USER_TYPE");}
		protected void populate() {
 			add(new Enum(ID_Admin,NAME_Admin));
 			add(new Enum(ID_User,NAME_User));
		}
}