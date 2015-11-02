package com.alchemytec.challenge.dropwizard;

import com.alchemytec.challenge.health.NoopHealthCheck;
import com.alchemytec.challenge.resources.BackendResource;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import org.eclipse.jetty.servlets.CrossOriginFilter;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import java.util.EnumSet;

public class BackendApplication extends Application<BackendConfiguration> {
    
    public static void main(String[] args) throws Exception {
        new BackendApplication().run(args);
    }

    @Override
    public String getName() {
        return "stub-backend";
    }

    @Override
    public void initialize(Bootstrap<BackendConfiguration> bootstrap) {
        // nothing to do yet
    }

    @Override
    public void run(BackendConfiguration configuration, Environment environment) {
        final BackendResource resource = new BackendResource();
        environment.jersey().register(resource);
        environment.healthChecks().register("no-op", new NoopHealthCheck());

        FilterRegistration.Dynamic filter = environment.servlets().addFilter("CORS", CrossOriginFilter.class);
        filter.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");
        filter.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM, "GET,PUT,POST,DELETE,OPTIONS");
        filter.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM, "*");
        filter.setInitParameter(CrossOriginFilter.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER, "*");
        filter.setInitParameter("allowedHeaders",
                "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin,");
        filter.setInitParameter("allowCredentials", "true");

    }

}