package com.rasp.app;
import platform.helper.HelperManager;
import platform.webservice.ServiceManager;
import com.rasp.app.helper.*;
import com.rasp.app.service.*;
public class Registry {
		public static void register(){
				 HelperManager.getInstance().register(FeedbackHelper.getInstance());
				 HelperManager.getInstance().register(MealHelper.getInstance());
				 HelperManager.getInstance().register(MenuItemHelper.getInstance());
				 HelperManager.getInstance().register(ResourceRoleHelper.getInstance());
				 HelperManager.getInstance().register(ReviewHelper.getInstance());
				 HelperManager.getInstance().register(RoleResourcePermissionHelper.getInstance());
				 HelperManager.getInstance().register(RoleUserResInstanceHelper.getInstance());
				 HelperManager.getInstance().register(SickMealHelper.getInstance());
				 HelperManager.getInstance().register(UserHelper.getInstance());
				 ServiceManager.getInstance().register(new FeedbackService());
				 ServiceManager.getInstance().register(new MealService());
				 ServiceManager.getInstance().register(new MenuItemService());
				 ServiceManager.getInstance().register(new ResourceRoleService());
				 ServiceManager.getInstance().register(new ReviewService());
				 ServiceManager.getInstance().register(new RoleResourcePermissionService());
				 ServiceManager.getInstance().register(new RoleUserResInstanceService());
				 ServiceManager.getInstance().register(new SickMealService());
				 ServiceManager.getInstance().register(new UserService());
		}
}
